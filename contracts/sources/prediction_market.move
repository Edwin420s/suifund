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

    // Error codes
    const EMarketClosed: u64 = 0;
    const EInvalidAmount: u64 = 1;
    const EOutcomeAlreadySet: u64 = 2;
    const ENotCreator: u64 = 3;

    struct PredictionMarket has key {
        id: UID,
        campaign_id: ID,
        question: String,
        creator: address,
        total_bets: u64,
        yes_bets: u64,
        no_bets: u64,
        resolution_time: u64,
        outcome: u8, // 0 = unresolved, 1 = yes, 2 = no
        bets: Bag
    }

    struct Bet has store {
        better: address,
        amount: u64,
        outcome: u8, // 1 = yes, 2 = no
        timestamp: u64
    }

    public fun create_market(
        campaign_id: ID,
        question: vector<u8>,
        resolution_time: u64,
        ctx: &mut TxContext
    ): PredictionMarket {
        PredictionMarket {
            id: object::new(ctx),
            campaign_id,
            question: utf8(question),
            creator: tx_context::sender(ctx),
            total_bets: 0,
            yes_bets: 0,
            no_bets: 0,
            resolution_time,
            outcome: 0,
            bets: bag::new(ctx)
        }
    }

    public entry fun place_bet(
        market: &mut PredictionMarket,
        outcome: u8,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(clock::timestamp_ms(clock) < market.resolution_time, EMarketClosed);
        assert!(outcome == 1 || outcome == 2, EInvalidAmount);

        let amount = coin::value(&payment);
        assert!(amount > 0, EInvalidAmount);

        // Update bet totals
        market.total_bets = market.total_bets + amount;
        if (outcome == 1) {
            market.yes_bets = market.yes_bets + amount;
        } else {
            market.no_bets = market.no_bets + amount;
        };

        // Record the bet
        let bet = Bet {
            better: tx_context::sender(ctx),
            amount,
            outcome,
            timestamp: clock::timestamp_ms(clock)
        };

        bag::add(&mut market.bets, bet);
    }

    public entry fun resolve_market(
        market: &mut PredictionMarket,
        outcome: u8,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(clock::timestamp_ms(clock) >= market.resolution_time, EMarketClosed);
        assert!(market.outcome == 0, EOutcomeAlreadySet);
        assert!(tx_context::sender(ctx) == market.creator, ENotCreator);
        assert!(outcome == 1 || outcome == 2, EInvalidAmount);

        market.outcome = outcome;

        // In a real implementation, you would distribute winnings here
        // based on the outcome and bet amounts
    }

    public entry fun claim_winnings(
        market: &mut PredictionMarket,
        ctx: &mut TxContext
    ) {
        assert!(market.outcome != 0, EMarketClosed);
        
        // In a real implementation, you would allow users to claim their winnings
        // based on their bets and the outcome
    }
}