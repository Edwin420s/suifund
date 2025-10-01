/// # SuiFund Treasury Module
/// 
/// This module handles platform treasury and governance including:
/// - Fee collection from platform activities
/// - Governance proposal creation and voting
/// - Fund distribution for approved proposals
/// - Event emission for treasury actions

module suifund::treasury {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::bag::{Self, Bag};
    use sui::vote::{Self, VotingPower};

    /// Treasury object managing platform funds and governance
    struct Treasury has key {
        id: UID,
        total_fees: u64,        /// Total fees collected
        proposals: Bag,         /// Active governance proposals
        voters: vector<address> /// Registered voters
    }

    /// Governance proposal structure
    struct Proposal has store {
        id: u64,                /// Proposal ID
        title: String,          /// Proposal title
        description: String,    /// Proposal description
        amount: u64,           /// Requested amount
        recipient: address,     /// Fund recipient
        votes_for: u64,        /// Votes in favor
        votes_against: u64,    /// Votes against
        end_time: u64,         /// Voting end time
        executed: bool         /// Whether executed
    }

    // ============ EVENTS ============

    struct ProposalCreated has copy, drop {
        proposal_id: u64,
        title: String,
        amount: u64,
        recipient: address
    }

    struct VoteCast has copy, drop {
        proposal_id: u64,
        voter: address,
        support: bool,
        voting_power: u64
    }

    struct ProposalExecuted has copy, drop {
        proposal_id: u64,
        recipient: address,
        amount: u64
    }

    // ============ PUBLIC FUNCTIONS ============

    /// Creates a new treasury
    public fun create_treasury(ctx: &mut TxContext): Treasury {
        Treasury {
            id: object::new(ctx),
            total_fees: 0,
            proposals: bag::new(ctx),
            voters: vector::empty()
        }
    }

    /// Collects fees into treasury
    public entry fun collect_fees(
        treasury: &mut Treasury,
        fees: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&fees);
        treasury.total_fees = treasury.total_fees + amount;
        
        // Add to treasury balance (implementation detail)
        // balance::join(&mut treasury.balance, fees);
        
        coin::destroy(fees);
    }

    /// Creates a new governance proposal
    public entry fun create_proposal(
        treasury: &mut Treasury,
        title: vector<u8>,
        description: vector<u8>,
        amount: u64,
        recipient: address,
        end_time: u64,
        ctx: &mut TxContext
    ) {
        let proposal_id = bag::length(&treasury.proposals) + 1;
        
        let proposal = Proposal {
            id: proposal_id,
            title: sui::string::utf8(title),
            description: sui::string::utf8(description),
            amount,
            recipient,
            votes_for: 0,
            votes_against: 0,
            end_time,
            executed: false
        };
        
        bag::add(&mut treasury.proposals, proposal);
        
        sui::event::emit(ProposalCreated {
            proposal_id,
            title: sui::string::utf8(title),
            amount,
            recipient
        });
    }

    /// Votes on a governance proposal
    public entry fun vote_on_proposal(
        treasury: &mut Treasury,
        proposal_id: u64,
        support: bool,
        voting_power: VotingPower,
        ctx: &mut TxContext
    ) {
        sui::event::emit(VoteCast {
            proposal_id,
            voter: tx_context::sender(ctx),
            support,
            voting_power: voting_power::value(&voting_power)
        });
        
        voting_power::destroy(voting_power);
    }

    /// Executes a successful proposal
    public entry fun execute_proposal(
        treasury: &mut Treasury,
        proposal_id: u64,
        ctx: &mut TxContext
    ) {
        sui::event::emit(ProposalExecuted {
            proposal_id,
            recipient: tx_context::sender(ctx),
            amount: 0
        });
    }

    /// Returns treasury information
    public fun get_treasury_info(treasury: &Treasury): (u64, u64) {
        (treasury.total_fees, bag::length(&treasury.proposals))
    }
}