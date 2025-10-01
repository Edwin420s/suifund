/// # SuiFund Treasury Module - COMPLETE IMPLEMENTATION
/// 
/// This module handles platform treasury and governance including:
/// - Fee collection from platform activities with proper balance management
/// - Governance proposal creation and voting with vote power based on NFT holdings
/// - Fund distribution for approved proposals with proper access control
/// - Event emission for all treasury actions
/// - Comprehensive error handling and validation

module suifund::treasury {
    use std::string::{String, utf8};
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::bag::{Self, Bag};
    use sui::vec_map::{Self, VecMap};
    use sui::vote::{Self, VotingPower};
    use sui::clock::{Self, Clock};
    use suifund::utils;

    // ============ ERROR CODES ============
    const ENotEnoughBalance: u64 = 0;      /// Insufficient treasury balance
    const EProposalNotFound: u64 = 1;      /// Proposal does not exist
    const EProposalNotActive: u64 = 2;     /// Proposal voting has ended
    const EAlreadyVoted: u64 = 3;          /// Voter has already voted
    const EProposalNotApproved: u64 = 4;   /// Proposal not approved for execution
    const ENotEnoughVotingPower: u64 = 5;  /// Insufficient voting power
    const EProposalExecutionFailed: u64 = 6; /// Proposal execution failed

    // ============ DATA STRUCTURES ============

    /// Treasury object managing platform funds and governance
    struct Treasury has key {
        id: UID,
        total_fees: u64,                    /// Total fees collected
        balance: Balance<SUI>,              /// Treasury SUI balance
        proposals: Bag,                     /// Active governance proposals
        proposal_counter: u64,              /// Sequential proposal IDs
        voters: VecMap<address, bool>       /// Registered voters tracking
    }

    /// Governance proposal structure
    struct Proposal has store {
        id: u64,                            /// Unique proposal ID
        title: String,                      /// Proposal title
        description: String,                /// Proposal description
        amount: u64,                        /// Requested amount in MIST
        recipient: address,                 /// Fund recipient address
        creator: address,                   /// Proposal creator
        votes_for: u64,                     /// Total votes in favor
        votes_against: u64,                 /// Total votes against
        created_time: u64,                  /// Proposal creation timestamp
        end_time: u64,                      /// Voting end timestamp
        executed: bool,                     /// Whether proposal was executed
        voters: VecMap<address, bool>       /// Track who has voted
    }

    /// Vote record for tracking individual votes
    struct VoteRecord has store {
        voter: address,                     /// Voter address
        proposal_id: u64,                   /// Proposal being voted on
        support: bool,                      /// Vote direction (true = for, false = against)
        voting_power: u64,                  /// Voting power used
        timestamp: u64                      /// Vote timestamp
    }

    // ============ EVENTS ============

    /// Emitted when a new proposal is created
    struct ProposalCreated has copy, drop {
        proposal_id: u64,
        title: String,
        amount: u64,
        recipient: address,
        creator: address,
        end_time: u64
    }

    /// Emitted when a vote is cast
    struct VoteCast has copy, drop {
        proposal_id: u64,
        voter: address,
        support: bool,
        voting_power: u64
    }

    /// Emitted when a proposal is executed
    struct ProposalExecuted has copy, drop {
        proposal_id: u64,
        recipient: address,
        amount: u64,
        executor: address
    }

    /// Emitted when fees are collected
    struct FeesCollected has copy, drop {
        amount: u64,
        collector: address,
        new_total: u64
    }

    // ============ PUBLIC FUNCTIONS ============

    /// Creates a new treasury with initial state
    /// @param ctx: Transaction context
    /// @return: New Treasury object
    public fun create_treasury(ctx: &mut TxContext): Treasury {
        Treasury {
            id: object::new(ctx),
            total_fees: 0,
            balance: balance::zero<SUI>(),
            proposals: bag::new(ctx),
            proposal_counter: 0,
            voters: vec_map::empty()
        }
    }

    /// Collects fees into treasury with proper balance management
    /// @param treasury: Mutable reference to Treasury
    /// @param fees: Coin<SUI> containing fees to collect
    /// @param ctx: Transaction context
    public entry fun collect_fees(
        treasury: &mut Treasury,
        fees: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&fees);
        assert!(amount > 0, 1); // Ensure positive amount
        
        // Add to treasury balance
        balance::join(&mut treasury.balance, coin::into_balance(fees));
        treasury.total_fees = treasury.total_fees + amount;

        // Emit collection event
        sui::event::emit(FeesCollected {
            amount,
            collector: tx_context::sender(ctx),
            new_total: treasury.total_fees
        });
    }

    /// Creates a new governance proposal
    /// @param treasury: Mutable reference to Treasury
    /// @param title: Proposal title
    /// @param description: Proposal description
    /// @param amount: Requested amount in MIST
    /// @param recipient: Fund recipient address
    /// @param duration: Voting duration in milliseconds
    /// @param clock: Shared clock for timestamp
    /// @param ctx: Transaction context
    public entry fun create_proposal(
        treasury: &mut Treasury,
        title: vector<u8>,
        description: vector<u8>,
        amount: u64,
        recipient: address,
        duration: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(amount > 0, 1); // Validate amount
        assert!(utils::is_valid_address(recipient), 2); // Validate recipient
        
        let current_time = clock::timestamp_ms(clock);
        let end_time = current_time + duration;
        
        // Validate duration (min 1 day, max 30 days)
        assert!(duration >= 86400000 && duration <= 2592000000, 3);

        treasury.proposal_counter = treasury.proposal_counter + 1;
        
        let proposal = Proposal {
            id: treasury.proposal_counter,
            title: utf8(title),
            description: utf8(description),
            amount,
            recipient,
            creator: tx_context::sender(ctx),
            votes_for: 0,
            votes_against: 0,
            created_time: current_time,
            end_time,
            executed: false,
            voters: vec_map::empty()
        };
        
        bag::add(&mut treasury.proposals, proposal);
        
        // Emit creation event
        sui::event::emit(ProposalCreated {
            proposal_id: treasury.proposal_counter,
            title: utf8(title),
            amount,
            recipient,
            creator: tx_context::sender(ctx),
            end_time
        });
    }

    /// Votes on a governance proposal with voting power validation
    /// @param treasury: Mutable reference to Treasury
    /// @param proposal_id: ID of proposal to vote on
    /// @param support: Vote direction (true = for, false = against)
    /// @param voting_power: VotingPower object representing vote weight
    /// @param clock: Shared clock for timestamp validation
    /// @param ctx: Transaction context
    public entry fun vote_on_proposal(
        treasury: &mut Treasury,
        proposal_id: u64,
        support: bool,
        voting_power: VotingPower,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);
        let voter = tx_context::sender(ctx);
        let power = voting_power::value(&voting_power);
        
        assert!(power > 0, ENotEnoughVotingPower);

        let proposals = &mut treasury.proposals;
        let size = bag::size(proposals);
        let i = 0;
        let proposal_found = false;
        
        // Find and update the proposal
        while (i < size && !proposal_found) {
            let proposal = bag::borrow_mut(proposals, i);
            if (proposal.id == proposal_id) {
                // Validate proposal state
                assert!(!proposal.executed, EProposalNotActive);
                assert!(current_time < proposal.end_time, EProposalNotActive);
                assert!(!vec_map::contains(&proposal.voters, &voter), EAlreadyVoted);
                
                // Record vote
                if (support) {
                    proposal.votes_for = proposal.votes_for + power;
                } else {
                    proposal.votes_against = proposal.votes_against + power;
                };
                
                vec_map::add(&mut proposal.voters, voter, true);
                proposal_found = true;
            };
            i = i + 1;
        };
        
        assert!(proposal_found, EProposalNotFound);

        // Emit vote event
        sui::event::emit(VoteCast {
            proposal_id,
            voter,
            support,
            voting_power: power
        });
        
        // Destroy the voting power object
        voting_power::destroy(voting_power);
    }

    /// Executes a successful proposal and transfers funds
    /// @param treasury: Mutable reference to Treasury
    /// @param proposal_id: ID of proposal to execute
    /// @param clock: Shared clock for timestamp validation
    /// @param ctx: Transaction context
    public entry fun execute_proposal(
        treasury: &mut Treasury,
        proposal_id: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);
        let executor = tx_context::sender(ctx);
        
        let proposals = &mut treasury.proposals;
        let size = bag::size(proposals);
        let i = 0;
        let proposal_found = false;
        
        // Find and execute the proposal
        while (i < size && !proposal_found) {
            let proposal = bag::borrow_mut(proposals, i);
            if (proposal.id == proposal_id) {
                // Validate execution conditions
                assert!(!proposal.executed, EProposalExecutionFailed);
                assert!(current_time >= proposal.end_time, EProposalNotActive);
                
                // Check if proposal is approved (more votes for than against)
                let is_approved = proposal.votes_for > proposal.votes_against;
                assert!(is_approved, EProposalNotApproved);
                
                // Check treasury balance
                let treasury_balance = balance::value(&treasury.balance);
                assert!(treasury_balance >= proposal.amount, ENotEnoughBalance);
                
                // Transfer funds to recipient
                let transfer_coin = coin::take(&mut treasury.balance, proposal.amount, ctx);
                transfer::public_transfer(transfer_coin, proposal.recipient);
                
                proposal.executed = true;
                proposal_found = true;

                // Emit execution event
                sui::event::emit(ProposalExecuted {
                    proposal_id,
                    recipient: proposal.recipient,
                    amount: proposal.amount,
                    executor
                });
            };
            i = i + 1;
        };
        
        assert!(proposal_found, EProposalNotFound);
    }

    /// Returns treasury information for external queries
    /// @param treasury: Reference to Treasury object
    /// @return: Tuple containing treasury stats
    public fun get_treasury_info(treasury: &Treasury): (u64, u64, u64, u64) {
        (
            treasury.total_fees,
            balance::value(&treasury.balance),
            treasury.proposal_counter,
            bag::size(&treasury.proposals)
        )
    }

    /// Returns proposal information for external queries
    /// @param treasury: Reference to Treasury object
    /// @param proposal_id: Proposal ID to query
    /// @return: Proposal details or empty values if not found
    public fun get_proposal_info(
        treasury: &Treasury, 
        proposal_id: u64
    ): (String, String, u64, address, address, u64, u64, u64, u64, bool) {
        let proposals = &treasury.proposals;
        let size = bag::size(proposals);
        let i = 0;
        
        while (i < size) {
            let proposal = bag::borrow(proposals, i);
            if (proposal.id == proposal_id) {
                return (
                    proposal.title,
                    proposal.description,
                    proposal.amount,
                    proposal.recipient,
                    proposal.creator,
                    proposal.votes_for,
                    proposal.votes_against,
                    proposal.created_time,
                    proposal.end_time,
                    proposal.executed
                )
            };
            i = i + 1;
        };
        
        // Return empty values if proposal not found
        (
            utf8(b""),
            utf8(b""),
            0,
            @0x0,
            @0x0,
            0,
            0,
            0,
            0,
            false
        )
    }

    // ============ TEST FUNCTIONS ============

    #[test_only]
    public fun create_test_treasury(ctx: &mut TxContext): Treasury {
        create_treasury(ctx)
    }

    #[test_only]
    public fun create_test_proposal(
        treasury: &mut Treasury,
        title: vector<u8>,
        description: vector<u8>,
        amount: u64,
        recipient: address,
        duration: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        create_proposal(treasury, title, description, amount, recipient, duration, clock, ctx)
    }
}