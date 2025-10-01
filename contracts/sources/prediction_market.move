/// # SuiFund Prediction Market Module
/// 
/// This module handles prediction markets for campaign outcomes including:
/// - Market creation for campaign events
/// - Bet placement with real SUI transfers
/// - Market resolution and outcome setting
/// - Automatic winnings calculation and distribution
/// - Event emission for all market actions
/// 
/// ## Mathematical Model:
/// - Winnings = (bet_amount / winning_pool) * losing_pool + bet_amount
/// - Ensures fair distribution based on market dynamics

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
    use suifund::utils;

    // ============ ERROR CODES ============
    const EMarketClosed: u64 = 0;        /// Market is closed for betting
    const EInvalidAmount: u64 = 1;       /// Invalid bet amount
    const EOutcomeAlreadySet: u64 = 2;   /// Market outcome already resolved
    const ENotCreator: u64 = 3;          /// Caller is not market creator
    const EInvalidOutcome: u64 = 4;      /// Invalid outcome value
    const EAlreadyClaimed: u64 = 5;      /// Winnings already claimed
    const ENotBetter: u64 = 6;           /// Caller is not a better
    const ENoWinnings: u64 = 7;          /// No winnings to claim

    // ============ OUTCOME CODES ============
    const OUTCOME_UNRESOLVED: u8 = 0;    /// Market outcome not yet determined
    const OUTCOME_YES: u8 = 1;           /// Yes/Positive outcome
    const OUTCOME_NO: u8 = 2;            /// No/Negative outcome

    // ============ DATA STRUCTURES ============

    /// Prediction Market object storing market state and bets
    struct PredictionMarket has key {
        id: UID,
        campaign_id: ID,          /// Associated campaign ID
        question: String,         /// Market question
        creator: address,         /// Market creator address
        total_bets: u64,          /// Total bets in MIST
        yes_bets: u64,           /// Total bets on YES outcome
        no_bets: u64,            /// Total bets on NO outcome
        resolution_time: u64,    /// Market resolution timestamp
        outcome: u8,             /// Resolved outcome
        bets: Bag,               /// Individual bet records
        resolved: bool,          /// Whether market is resolved
        balance: Balance<SUI>    /// Market balance holding all bets
    }

    /// Individual bet record
    struct Bet has store {
        better: address,         /// Better's address
        amount: u64,            /// Bet amount in MIST
        outcome: u8,            /// Chosen outcome
        timestamp: u64,         /// Bet timestamp
        winnings_claimed: bool  /// Whether winnings claimed
    }

    // ============ EVENTS ============

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

    struct WinningsClaimed has copy, drop {
        market_id: ID,
        better: address,
        amount: u64
    }

    // ============ PUBLIC FUNCTIONS ============

    /// Creates a new prediction market for a campaign
    public fun create_market(
        campaign_id: ID,
        question: vector<u8>,
        resolution_time: u64,
        ctx: &mut TxContext
    ): PredictionMarket {
        assert!(resolution_time > utils::current_timestamp_ms(), EMarketClosed);

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
            resolved: false,
            balance: balance::zero<SUI>()
        };

        sui::event::emit(MarketCreated {
            market_id: object::id(&market),
            campaign_id,
            creator: tx_context::sender(ctx),
            resolution_time
        });

        market
    }

    /// Places a bet on a market outcome
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

        // Add to market balance
        balance::join(&mut market.balance, coin::into_balance(payment));

        // Record the bet
        let bet = Bet {
            better: tx_context::sender(ctx),
            amount,
            outcome,
            timestamp: clock::timestamp_ms(clock),
            winnings_claimed: false
        };

        bag::add(&mut market.bets, bet);

        sui::event::emit(BetPlaced {
            market_id: object::id(market),
            better: tx_context::sender(ctx),
            amount,
            outcome
        });
    }

    /// Resolves market with final outcome
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

        sui::event::emit(MarketResolved {
            market_id: object::id(market),
            outcome
        });
    }

    /// Claims winnings for winning bets
    public entry fun claim_winnings(
        market: &mut PredictionMarket,
        better: address,
        ctx: &mut TxContext
    ) {
        assert!(market.resolved, EMarketClosed);

        let bets = &mut market.bets;
        let size = bag::size(bets);
        let i = 0;
        let total_winnings = 0;
        let total_bet_amount = 0;

        // Calculate total bets on winning outcome
        let winning_pool = if (market.outcome == OUTCOME_YES) market.yes_bets else market.no_bets;
        let losing_pool = if (market.outcome == OUTCOME_YES) market.no_bets else market.yes_bets;

        // Find all winning bets for this better
        while (i < size) {
            let bet = bag::borrow_mut(bets, i);
            if (bet.better == better && bet.outcome == market.outcome && !bet.winnings_claimed) {
                total_bet_amount = total_bet_amount + bet.amount;
                bet.winnings_claimed = true;
            };
            i = i + 1;
        };

        assert!(total_bet_amount > 0, ENotBetter);

        // Calculate winnings: (bet_amount / winning_pool) * losing_pool + bet_amount
        let winnings = if (winning_pool > 0) {
            utils::calculate_share(losing_pool, total_bet_amount, winning_pool) + total_bet_amount
        } else {
            total_bet_amount
        };

        assert!(winnings > 0, ENoWinnings);
        assert!(balance::value(&market.balance) >= winnings, EInvalidAmount);

        // Transfer winnings
        let winnings_coin = coin::take(&mut market.balance, winnings, ctx);
        transfer::public_transfer(winnings_coin, better);

        sui::event::emit(WinningsClaimed {
            market_id: object::id(market),
            better,
            amount: winnings
        });
    }

    /// Returns market information for external queries
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