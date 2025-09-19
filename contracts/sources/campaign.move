module suifund::campaign {
    use std::string::{String, utf8};
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::clock::{Self, Clock};
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::url::{Self, Url};

    // Error codes
    const ENotCreator: u64 = 0;
    const EGoalReached: u64 = 1;
    const EGoalNotReached: u64 = 2;
    const ECampaignEnded: u64 = 3;
    const EInvalidAmount: u64 = 4;
    const EInvalidBeneficiary: u64 = 5;

    // Campaign status
    const STATUS_ACTIVE: u8 = 0;
    const STATUS_COMPLETED: u8 = 1;
    const STATUS_FAILED: u8 = 2;

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
        beneficiaries: vector<Beneficiary>
    }

    struct Beneficiary has store {
        address: address,
        percentage: u64
    }

    struct Contribution has key, store {
        id: UID,
        campaign_id: ID,
        contributor: address,
        amount: u64,
        timestamp: u64
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

        Campaign {
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
            beneficiaries
        }
    }

    public entry fun contribute(
        campaign: &mut Campaign,
        payment: Coin<SUI>,
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
            id: object::new(ctx),
            campaign_id: object::id(campaign),
            contributor: tx_context::sender(ctx),
            amount,
            timestamp: current_time
        };

        transfer::transfer(contribution, tx_context::sender(ctx));

        // Check if goal is reached
        if (campaign.raised >= campaign.goal) {
            campaign.status = STATUS_COMPLETED;
        };
    }

    public entry fun refund(
        campaign: &mut Campaign,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms();
        assert!(current_time >= campaign.deadline, ECampaignEnded);
        assert!(campaign.raised < campaign.goal, EGoalReached);
        assert!(campaign.status == STATUS_ACTIVE, ECampaignEnded);

        campaign.status = STATUS_FAILED;
        // In a real implementation, you would process refunds here
        // This would require tracking individual contributions
    }

    public entry fun distribute_funds(
        campaign: &mut Campaign,
        ctx: &mut TxContext
    ) {
        assert!(campaign.status == STATUS_COMPLETED, EGoalNotReached);
        assert!(tx_context::sender(ctx) == campaign.creator, ENotCreator);

        // In a real implementation, you would distribute funds to beneficiaries
        // based on their percentages
        campaign.status = STATUS_COMPLETED;
    }
}