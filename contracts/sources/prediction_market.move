module suifund::prediction_market {
    use std::string::{String, utf8};
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::clock::{Self, Clock};
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::bag::{Self, Bag};
    use sui::vec_map::{Self, VecMap};

    // Error codes
    const EMarketClosed: u64 = 0;
    const EInvalidAmount: u64 = 1;
    const EOutcomeAlreadySet: u64 = 2;
    const ENotCreator: u64 = 3;
    const EInvalidOutcome: u64 = 4;
    const EAlreadyClaimed: u64 = 5;

    // Outcomes
    const OUTCOME_UNRESOLVED: u8 = 0;
    const OUTCOME_YES: u8 = 1;
    const OUTCOME_NO: u8 = 2;

    struct PredictionMarket has key {
        id: UID,
        campaign_id: ID,
        question: String,
        creator: address,
        total_bets: u64,
        yes_bets: u64,
        no_bets: u64,
        resolution_time: u64,
        outcome: u8,
        bets: Bag,
        resolved: bool
    }

    struct Bet has store {
        better: address,
        amount: u64,
        outcome: u8,
        timestamp: u64,
        winnings_claimed: bool
    }

    struct MarketCreated has copy, drop {
        market_id: ID,
        campaign_id: ID,
        creator: address,
        resolution_time: u64
    }

    struct BetPlaced has copy, drop {
        market_id: ID,
        better: address,
        amount: u64,
        outcome: u8
    }

    struct MarketResolved has copy, drop {
        market_id: ID,
        outcome: u8
    }

    public fun create_market(
        campaign_id: ID,
        question: vector<u8>,
        resolution_time: u64,
        ctx: &mut TxContext
    ): PredictionMarket {
        let market = PredictionMarket {
            id: object::new(ctx),
            campaign_id,
            question: utf8(question),
            creator: tx_context::sender(ctx),
            total_bets: 0,
            yes_bets: 0,
            no_bets: 0,
            resolution_time,
            outcome: OUTCOME_UNRESOLVED,
            bets: bag::new(ctx),
            resolved: false
        };

        // Emit creation event
        sui::event::emit(MarketCreated {
            market_id: object::id(&market),
            campaign_id,
            creator: tx_context::sender(ctx),
            resolution_time
        });

        market
    }

    public entry fun place_bet(
        market: &mut PredictionMarket,
        outcome: u8,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(clock::timestamp_ms(clock) < market.resolution_time, EMarketClosed);
        assert!(outcome == OUTCOME_YES || outcome == OUTCOME_NO, EInvalidOutcome);
        assert!(!market.resolved, EMarketClosed);

        let amount = coin::value(&payment);
        assert!(amount > 0, EInvalidAmount);

        // Update bet totals
        market.total_bets = market.total_bets + amount;
        if (outcome == OUTCOME_YES) {
            market.yes_bets = market.yes_bets + amount;
        } else {
            market.no_bets = market.no_bets + amount;
        };

        // Record the bet
        let bet = Bet {
            better: tx_context::sender(ctx),
            amount,
            outcome,
            timestamp: clock::timestamp_ms(clock),
            winnings_claimed: false
        };

        bag::add(&mut market.bets, bet);

        // Emit bet event
        sui::event::emit(BetPlaced {
            market_id: object::id(market),
            better: tx_context::sender(ctx),
            amount,
            outcome
        });

        // Destroy the payment coin (in real implementation, this would be stored)
        coin::destroy(payment);
    }

    public entry fun resolve_market(
        market: &mut PredictionMarket,
        outcome: u8,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(clock::timestamp_ms(clock) >= market.resolution_time, EMarketClosed);
        assert!(market.outcome == OUTCOME_UNRESOLVED, EOutcomeAlreadySet);
        assert!(tx_context::sender(ctx) == market.creator, ENotCreator);
        assert!(outcome == OUTCOME_YES || outcome == OUTCOME_NO, EInvalidOutcome);

        market.outcome = outcome;
        market.resolved = true;

        // Emit resolution event
        sui::event::emit(MarketResolved {
            market_id: object::id(market),
            outcome
        });
    }

    public entry fun claim_winnings(
        market: &mut PredictionMarket,
        better: address,
        ctx: &mut TxContext
    ) {
        assert!(market.resolved, EMarketClosed);

        // In a real implementation, you would:
        // 1. Find all bets by this better for the winning outcome
        // 2. Calculate their share of the winnings
        // 3. Transfer the winnings to the better
        // 4. Mark the bets as claimed
    }

    // Helper function to get market info
    public fun get_market_info(market: &PredictionMarket): (ID, String, address, u64, u64, u64, u64, u8, bool) {
        (
            market.campaign_id,
            market.question,
            market.creator,
            market.total_bets,
            market.yes_bets,
            market.no_bets,
            market.resolution_time,
            market.outcome,
            market.resolved
        )
    }
}