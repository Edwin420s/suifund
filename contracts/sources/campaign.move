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
    use sui::vec_map::{Self, VecMap};
    use sui::bag::{Self, Bag};

    // Error codes
    const ENotCreator: u64 = 0;
    const EGoalReached: u64 = 1;
    const EGoalNotReached: u64 = 2;
    const ECampaignEnded: u64 = 3;
    const EInvalidAmount: u64 = 4;
    const EInvalidBeneficiary: u64 = 5;
    const EAlreadyRefunded: u64 = 6;
    const ENotContributor: u64 = 7;

    // Campaign status
    const STATUS_ACTIVE: u8 = 0;
    const STATUS_COMPLETED: u8 = 1;
    const STATUS_FAILED: u8 = 2;
    const STATUS_REFUNDING: u64 = 3;

    struct Campaign has key, store {
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
        refund_processed: bool
    }

    struct Beneficiary has store {
        address: address,
        percentage: u64
    }

    struct Contribution has store {
        contributor: address,
        amount: u64,
        timestamp: u64,
        refund_claimed: bool
    }

    struct CampaignCreated has copy, drop {
        campaign_id: ID,
        creator: address,
        goal: u64,
        deadline: u64
    }

    struct ContributionMade has copy, drop {
        campaign_id: ID,
        contributor: address,
        amount: u64
    }

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
        while (i < len) {
            let beneficiary = vector::borrow(&beneficiaries, i);
            total_percentage = total_percentage + beneficiary.percentage;
            i = i + 1;
        };

        assert!(total_percentage == 100, EInvalidBeneficiary);

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

        campaign.raised = campaign.raised + amount;
        campaign.backers = campaign.backers + 1;

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

        // Check if goal is reached
        if (campaign.raised >= campaign.goal) {
            campaign.status = STATUS_COMPLETED;
        };

        // Destroy the payment coin (in real implementation, this would be stored)
        coin::destroy(payment);
    }

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

        // In a real implementation, you would process refunds here
        // This would require tracking individual contributions and sending coins back
    }

    public entry fun claim_refund(
        campaign: &mut Campaign,
        contributor: address,
        ctx: &mut TxContext
    ) {
        assert!(campaign.status == STATUS_FAILED, EGoalReached);
        assert!(campaign.refund_processed, EAlreadyRefunded);

        // In a real implementation, you would find the contributor's
        // contribution and refund them if they haven't claimed yet
    }

    public entry fun distribute_funds(
        campaign: &mut Campaign,
        ctx: &mut TxContext
    ) {
        assert!(campaign.status == STATUS_COMPLETED, EGoalNotReached);
        assert!(tx_context::sender(ctx) == campaign.creator, ENotCreator);

        // In a real implementation, you would distribute funds to beneficiaries
        // based on their percentages
    }

    // Helper function to get campaign info
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
}