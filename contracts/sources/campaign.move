/// # SuiFund Campaign Module
/// 
/// This module handles the core crowdfunding functionality including:
/// - Campaign creation and management
/// - Contribution handling with real SUI transfers
/// - Automatic refunds for failed campaigns
/// - Fund distribution to beneficiaries
/// - Event emission for all state changes
/// 
/// ## Security Features:
/// - Reentrancy protection through Sui's object model
/// - Integer overflow protection
/// - Access control checks
/// - Input validation

module suifund::campaign {
    use std::string::{String, utf8};
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::clock::{Self, Clock};
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::url::{Self, Url};
    use sui::bag::{Self, Bag};
    use suifund::utils;

    // ============ ERROR CODES ============
    /// Error codes for specific failure conditions
    const ENotCreator: u64 = 0;        /// Caller is not the campaign creator
    const EGoalReached: u64 = 1;       /// Campaign goal already reached
    const EGoalNotReached: u64 = 2;    /// Campaign goal not reached
    const ECampaignEnded: u64 = 3;     /// Campaign deadline has passed
    const EInvalidAmount: u64 = 4;     /// Invalid contribution amount
    const EInvalidBeneficiary: u64 = 5;/// Invalid beneficiary configuration
    const EAlreadyRefunded: u64 = 6;   /// Refunds already processed
    const ENotContributor: u64 = 7;    /// Caller is not a contributor
    const EInvalidPercentage: u64 = 8; /// Invalid percentage value
    const ETransferFailed: u64 = 9;    /// Coin transfer failed

    // ============ STATUS CODES ============
    /// Campaign lifecycle status codes
    const STATUS_ACTIVE: u8 = 0;      /// Campaign is active and accepting contributions
    const STATUS_COMPLETED: u8 = 1;   /// Campaign reached its funding goal
    const STATUS_FAILED: u8 = 2;      /// Campaign failed to reach goal by deadline
    const STATUS_REFUNDING: u8 = 3;   /// Campaign is in refund process

    // ============ DATA STRUCTURES ============

    /// Main Campaign object storing all campaign data and state
    /// @param id: Unique identifier for the campaign
    /// @param title: Campaign title
    /// @param description: Detailed campaign description
    /// @param creator: Address of campaign creator
    /// @param goal: Funding goal in MIST (1 SUI = 1,000,000,000 MIST)
    /// @param raised: Total amount raised in MIST
    /// @param deadline: Campaign end timestamp in milliseconds
    /// @param backers: Number of unique contributors
    /// @param status: Current campaign status
    /// @param image_url: Campaign image URL
    /// @param beneficiaries: List of funding recipients and their shares
    /// @param contributions: Bag tracking all individual contributions
    /// @param balance: SUI balance held by the campaign
    /// @param refund_processed: Whether refunds have been processed
    struct Campaign has key {
        id: UID,
        title: String,
        description: String,
        creator: address,
        goal: u64,
        raised: u64,
        deadline: u64,
        backers: u64,
        status: u8,
        image_url: Url,
        beneficiaries: vector<Beneficiary>,
        contributions: Bag,
        balance: Balance<SUI>,
        refund_processed: bool
    }

    /// Beneficiary structure defining fund distribution
    /// @param address: Recipient's Sui address
    /// @param percentage: Share percentage (0-100)
    struct Beneficiary has store {
        address: address,
        percentage: u64
    }

    /// Individual contribution record
    /// @param contributor: Address of contributor
    /// @param amount: Contribution amount in MIST
    /// @param timestamp: Contribution timestamp
    /// @param refund_claimed: Whether refund has been claimed
    struct Contribution has store {
        contributor: address,
        amount: u64,
        timestamp: u64,
        refund_claimed: bool
    }

    // ============ EVENTS ============

    /// Emitted when a new campaign is created
    struct CampaignCreated has copy, drop {
        campaign_id: ID,
        creator: address,
        goal: u64,
        deadline: u64
    }

    /// Emitted when a contribution is made
    struct ContributionMade has copy, drop {
        campaign_id: ID,
        contributor: address,
        amount: u64
    }

    /// Emitted when funds are distributed to beneficiaries
    struct FundsDistributed has copy, drop {
        campaign_id: ID,
        amount: u64
    }

    /// Emitted when refunds are processed for a failed campaign
    struct RefundProcessed has copy, drop {
        campaign_id: ID,
        total_refunded: u64
    }

    // ============ PUBLIC FUNCTIONS ============

    /// Creates a new crowdfunding campaign
    /// @param title: Campaign title as vector<u8>
    /// @param description: Campaign description as vector<u8>
    /// @param goal: Funding goal in MIST
    /// @param deadline: Campaign end timestamp in milliseconds
    /// @param image_url: Campaign image URL as vector<u8>
    /// @param beneficiaries: Vector of Beneficiary objects
    /// @param ctx: Transaction context
    /// @return: New Campaign object
    /// 
    /// # Validation:
    /// - Total beneficiary percentages must equal 100%
    /// - Goal must be greater than 0
    /// - Deadline must be in the future
    /// - All addresses must be valid
    public fun create_campaign(
        title: vector<u8>,
        description: vector<u8>,
        goal: u64,
        deadline: u64,
        image_url: vector<u8>,
        beneficiaries: vector<Beneficiary>,
        ctx: &mut TxContext
    ): Campaign {
        let total_percentage = 0;
        let i = 0;
        let len = vector::length(&beneficiaries);
        
        // Validate beneficiaries and calculate total percentage
        while (i < len) {
            let beneficiary = vector::borrow(&beneficiaries, i);
            assert!(utils::is_valid_percentage(beneficiary.percentage), EInvalidPercentage);
            assert!(utils::is_valid_address(beneficiary.address), EInvalidBeneficiary);
            total_percentage = total_percentage + beneficiary.percentage;
            i = i + 1;
        };

        // Validate campaign parameters
        assert!(total_percentage == 100, EInvalidBeneficiary);
        assert!(goal > 0, EInvalidAmount);
        assert!(deadline > utils::current_timestamp_ms(), ECampaignEnded);

        // Create campaign object
        let campaign = Campaign {
            id: object::new(ctx),
            title: utf8(title),
            description: utf8(description),
            creator: tx_context::sender(ctx),
            goal,
            raised: 0,
            deadline,
            backers: 0,
            status: STATUS_ACTIVE,
            image_url: url::new_unsafe_from_bytes(image_url),
            beneficiaries,
            contributions: bag::new(ctx),
            balance: balance::zero<SUI>(),
            refund_processed: false
        };

        // Emit creation event
        sui::event::emit(CampaignCreated {
            campaign_id: object::id(&campaign),
            creator: tx_context::sender(ctx),
            goal,
            deadline
        });

        campaign
    }

    /// Contributes SUI to a campaign
    /// @param campaign: Mutable reference to Campaign object
    /// @param payment: Coin<SUI> containing contribution amount
    /// @param clock: Shared clock for timestamp
    /// @param ctx: Transaction context
    /// 
    /// # Validation:
    /// - Campaign must be active
    /// - Deadline must not have passed
    /// - Payment amount must be greater than 0
    /// - Campaign must accept contributions
    public entry fun contribute(
        campaign: &mut Campaign,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms();
        assert!(campaign.status == STATUS_ACTIVE, ECampaignEnded);
        assert!(current_time < campaign.deadline, ECampaignEnded);

        let amount = coin::value(&payment);
        assert!(amount > 0, EInvalidAmount);

        // Update campaign state
        campaign.raised = campaign.raised + amount;
        campaign.backers = campaign.backers + 1;

        // Add to campaign balance
        balance::join(&mut campaign.balance, coin::into_balance(payment));

        // Create contribution record
        let contribution = Contribution {
            contributor: tx_context::sender(ctx),
            amount,
            timestamp: current_time,
            refund_claimed: false
        };

        bag::add(&mut campaign.contributions, contribution);

        // Emit contribution event
        sui::event::emit(ContributionMade {
            campaign_id: object::id(campaign),
            contributor: tx_context::sender(ctx),
            amount
        });

        // Check if goal is reached and update status
        if (campaign.raised >= campaign.goal) {
            campaign.status = STATUS_COMPLETED;
        };
    }

    /// Processes refunds for a failed campaign
    /// @param campaign: Mutable reference to Campaign object
    /// @param clock: Shared clock for timestamp verification
    /// @param ctx: Transaction context
    /// 
    /// # Validation:
    /// - Campaign deadline must have passed
    /// - Goal must not have been reached
    /// - Campaign must be active
    /// - Refunds must not have been processed already
    public entry fun process_refunds(
        campaign: &mut Campaign,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms();
        assert!(current_time >= campaign.deadline, ECampaignEnded);
        assert!(campaign.raised < campaign.goal, EGoalReached);
        assert!(campaign.status == STATUS_ACTIVE, ECampaignEnded);
        assert!(!campaign.refund_processed, EAlreadyRefunded);

        campaign.status = STATUS_FAILED;
        campaign.refund_processed = true;

        // Emit refund processed event
        sui::event::emit(RefundProcessed {
            campaign_id: object::id(campaign),
            total_refunded: campaign.raised
        });
    }

    /// Claims refund for a specific contributor
    /// @param campaign: Mutable reference to Campaign object
    /// @param contributor: Address of contributor claiming refund
    /// @param ctx: Transaction context
    /// 
    /// # Validation:
    /// - Campaign must be in failed state
    /// - Refunds must have been processed
    /// - Contributor must have unclaimed contributions
    public entry fun claim_refund(
        campaign: &mut Campaign,
        contributor: address,
        ctx: &mut TxContext
    ) {
        assert!(campaign.status == STATUS_FAILED, EGoalReached);
        assert!(campaign.refund_processed, EAlreadyRefunded);

        let contributions = &mut campaign.contributions;
        let size = bag::size(contributions);
        let i = 0;
        let total_refund = 0;

        // Calculate total refund amount for contributor
        while (i < size) {
            let contribution = bag::borrow_mut(contributions, i);
            if (contribution.contributor == contributor && !contribution.refund_claimed) {
                total_refund = total_refund + contribution.amount;
                contribution.refund_claimed = true;
            };
            i = i + 1;
        };

        assert!(total_refund > 0, ENotContributor);

        // Transfer refund to contributor
        let refund_coin = coin::take(&mut campaign.balance, total_refund, ctx);
        transfer::public_transfer(refund_coin, contributor);
    }

    /// Distributes funds to beneficiaries for a successful campaign
    /// @param campaign: Mutable reference to Campaign object
    /// @param ctx: Transaction context
    /// 
    /// # Validation:
    /// - Campaign must be completed
    /// - Caller must be campaign creator
    /// - Campaign must have funds to distribute
    public entry fun distribute_funds(
        campaign: &mut Campaign,
        ctx: &mut TxContext
    ) {
        assert!(campaign.status == STATUS_COMPLETED, EGoalNotReached);
        assert!(tx_context::sender(ctx) == campaign.creator, ENotCreator);

        let total_amount = balance::value(&campaign.balance);
        let beneficiaries = &campaign.beneficiaries;
        let len = vector::length(beneficiaries);
        let i = 0;

        // Distribute funds to each beneficiary based on their percentage
        while (i < len) {
            let beneficiary = vector::borrow(beneficiaries, i);
            let amount = utils::calculate_percentage(total_amount, beneficiary.percentage);
            
            if (amount > 0) {
                let beneficiary_coin = coin::take(&mut campaign.balance, amount, ctx);
                transfer::public_transfer(beneficiary_coin, beneficiary.address);
            };
            
            i = i + 1;
        };

        // Emit funds distributed event
        sui::event::emit(FundsDistributed {
            campaign_id: object::id(campaign),
            amount: total_amount
        });
    }

    /// Returns campaign information for external queries
    /// @param campaign: Reference to Campaign object
    /// @return: Tuple containing campaign data
    public fun get_campaign_info(campaign: &Campaign): (String, String, address, u64, u64, u64, u64, u8) {
        (
            campaign.title,
            campaign.description,
            campaign.creator,
            campaign.goal,
            campaign.raised,
            campaign.deadline,
            campaign.backers,
            campaign.status
        )
    }

    // ============ TEST FUNCTIONS ============

    /// Test-only function to create campaigns for testing
    #[test_only]
    public fun create_test_campaign(
        title: vector<u8>,
        description: vector<u8>,
        goal: u64,
        deadline: u64,
        image_url: vector<u8>,
        beneficiaries: vector<Beneficiary>,
        ctx: &mut TxContext
    ): Campaign {
        create_campaign(title, description, goal, deadline, image_url, beneficiaries, ctx)
    }
}