module suifund::treasury {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::bag::{Self, Bag};
    use sui::vec_map::{Self, VecMap};
    use sui::vote::{Self, VotingPower};

    struct Treasury has key {
        id: UID,
        total_fees: u64,
        proposals: Bag,
        voters: vector<address>
    }

    struct Proposal has store {
        id: u64,
        title: String,
        description: String,
        amount: u64,
        recipient: address,
        votes_for: u64,
        votes_against: u64,
        end_time: u64,
        executed: bool
    }

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

    public fun create_treasury(ctx: &mut TxContext): Treasury {
        Treasury {
            id: object::new(ctx),
            total_fees: 0,
            proposals: bag::new(ctx),
            voters: vector::empty()
        }
    }

    public entry fun collect_fees(
        treasury: &mut Treasury,
        fees: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&fees);
        treasury.total_fees = treasury.total_fees + amount;
        
        // Add to treasury balance (in real implementation)
        // balance::join(&mut treasury.balance, fees);
        
        // Destroy for now since we're not actually storing balance
        coin::destroy(fees);
    }

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
        
        // Emit creation event
        sui::event::emit(ProposalCreated {
            proposal_id,
            title: sui::string::utf8(title),
            amount,
            recipient
        });
    }

    public entry fun vote_on_proposal(
        treasury: &mut Treasury,
        proposal_id: u64,
        support: bool,
        voting_power: VotingPower,
        ctx: &mut TxContext
    ) {
        // In a real implementation, you would:
        // 1. Find the proposal by ID
        // 2. Verify the vote hasn't ended
        // 3. Add the voting power to the appropriate side
        // 4. Emit a VoteCast event
        
        sui::event::emit(VoteCast {
            proposal_id,
            voter: tx_context::sender(ctx),
            support,
            voting_power: voting_power::value(&voting_power)
        });
        
        // Destroy the voting power
        voting_power::destroy(voting_power);
    }

    public entry fun execute_proposal(
        treasury: &mut Treasury,
        proposal_id: u64,
        ctx: &mut TxContext
    ) {
        // In a real implementation, you would:
        // 1. Find the proposal by ID
        // 2. Verify it has enough votes and hasn't been executed
        // 3. Transfer funds from treasury to recipient
        // 4. Mark as executed
        // 5. Emit ProposalExecuted event
        
        sui::event::emit(ProposalExecuted {
            proposal_id,
            recipient: tx_context::sender(ctx), // Mock recipient
            amount: 0 // Mock amount
        });
    }

    // Helper function to get treasury info
    public fun get_treasury_info(treasury: &Treasury): (u64, u64) {
        (treasury.total_fees, bag::length(&treasury.proposals))
    }
}