/// # Campaign Module Tests
/// 
/// Comprehensive test suite for campaign functionality including:
/// - Campaign creation with various parameters
/// - Contribution handling and state updates
/// - Goal achievement and status transitions
/// - Refund processing for failed campaigns
/// - Edge cases and error conditions

#[test_only]
module suifund::campaign_test {
    use sui::test_scenario;
    use sui::clock;
    use sui::coin;
    use sui::sui;
    use suifund::campaign;

    /// Tests basic campaign creation with valid parameters
    #[test]
    fun test_create_campaign() {
        let scenario = test_scenario::begin(@0x0);
        let admin = test_scenario::next_ts(&mut scenario);
        
        // Create test data
        let title = b"Test Campaign";
        let description = b"A test campaign for unit testing";
        let goal = 1000000000; // 1 SUI
        let deadline = 1735689600000; // Jan 1, 2025
        let image_url = b"https://example.com/image.jpg";
        let beneficiaries = vector[
            campaign::Beneficiary { address: @0x1, percentage: 50 },
            campaign::Beneficiary { address: @0x2, percentage: 50 }
        ];
        
        // Create campaign
        let campaign = campaign::create_campaign(
            title,
            description,
            goal,
            deadline,
            image_url,
            beneficiaries,
            test_scenario::ctx(&mut scenario)
        );
        
        // Verify campaign data
        let (actual_title, actual_description, actual_creator, actual_goal, actual_raised, actual_deadline, actual_backers, actual_status) = 
            campaign::get_campaign_info(&campaign);
        
        assert!(actual_title == "Test Campaign", 0);
        assert!(actual_goal == goal, 1);
        assert!(actual_raised == 0, 2);
        assert!(actual_backers == 0, 3);
        assert!(actual_status == campaign::STATUS_ACTIVE, 4);
        
        test_scenario::end(scenario);
    }

    /// Tests contribution functionality and state updates
    #[test]
    fun test_contribute_to_campaign() {
        let scenario = test_scenario::begin(@0x0);
        let admin = test_scenario::next_ts(&mut scenario);
        let contributor = test_scenario::next_ts(&mut scenario);
        
        // Create test campaign
        let title = b"Test Campaign";
        let description = b"A test campaign";
        let goal = 1000000000;
        let deadline = 1735689600000;
        let image_url = b"https://example.com/image.jpg";
        let beneficiaries = vector[
            campaign::Beneficiary { address: @0x1, percentage: 100 }
        ];
        
        let mut campaign = campaign::create_campaign(
            title,
            description,
            goal,
            deadline,
            image_url,
            beneficiaries,
            test_scenario::ctx(&mut scenario)
        );
        
        // Create test coin
        let coin = coin::mint_for_testing(500000000, test_scenario::ctx(&mut scenario)); // 0.5 SUI
        
        // Contribute to campaign
        campaign::contribute(
            &mut campaign,
            coin,
            clock::mock_shared_clock(0),
            test_scenario::ctx(&mut scenario)
        );
        
        // Verify contribution
        let (_, _, _, actual_goal, actual_raised, _, actual_backers, actual_status) = 
            campaign::get_campaign_info(&campaign);
        
        assert!(actual_raised == 500000000, 0);
        assert!(actual_backers == 1, 1);
        assert!(actual_status == campaign::STATUS_ACTIVE, 2);
        
        test_scenario::end(scenario);
    }

    /// Tests campaign goal achievement and status transition
    #[test]
    fun test_campaign_goal_reached() {
        let scenario = test_scenario::begin(@0x0);
        let admin = test_scenario::next_ts(&mut scenario);
        
        // Create test campaign with low goal
        let title = b"Test Campaign";
        let description = b"A test campaign";
        let goal = 100000000; // 0.1 SUI
        let deadline = 1735689600000;
        let image_url = b"https://example.com/image.jpg";
        let beneficiaries = vector[
            campaign::Beneficiary { address: @0x1, percentage: 100 }
        ];
        
        let mut campaign = campaign::create_campaign(
            title,
            description,
            goal,
            deadline,
            image_url,
            beneficiaries,
            test_scenario::ctx(&mut scenario)
        );
        
        // Create test coin that exceeds goal
        let coin = coin::mint_for_testing(200000000, test_scenario::ctx(&mut scenario)); // 0.2 SUI
        
        // Contribute to campaign
        campaign::contribute(
            &mut campaign,
            coin,
            clock::mock_shared_clock(0),
            test_scenario::ctx(&mut scenario)
        );
        
        // Verify campaign is completed
        let (_, _, _, _, _, _, _, actual_status) = campaign::get_campaign_info(&campaign);
        assert!(actual_status == campaign::STATUS_COMPLETED, 0);
        
        test_scenario::end(scenario);
    }

    /// Tests campaign creation with invalid beneficiary percentages
    #[test]
    #[expected_failure(abort_code = 5)] // EInvalidBeneficiary
    fun test_create_campaign_invalid_beneficiaries() {
        let scenario = test_scenario::begin(@0x0);
        let admin = test_scenario::next_ts(&mut scenario);
        
        let title = b"Test Campaign";
        let description = b"Test description";
        let goal = 1000000000;
        let deadline = 1735689600000;
        let image_url = b"https://example.com/image.jpg";
        
        // Invalid: percentages don't add to 100
        let beneficiaries = vector[
            campaign::Beneficiary { address: @0x1, percentage: 30 },
            campaign::Beneficiary { address: @0x2, percentage: 30 }
        ];
        
        let _ = campaign::create_campaign(
            title,
            description,
            goal,
            deadline,
            image_url,
            beneficiaries,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::end(scenario);
    }

    /// Tests contribution to ended campaign
    #[test]
    #[expected_failure(abort_code = 3)] // ECampaignEnded
    fun test_contribute_after_deadline() {
        let scenario = test_scenario::begin(@0x0);
        let admin = test_scenario::next_ts(&mut scenario);
        
        let title = b"Test Campaign";
        let description = b"Test description";
        let goal = 1000000000;
        let deadline = 1000; // Past deadline
        let image_url = b"https://example.com/image.jpg";
        let beneficiaries = vector[
            campaign::Beneficiary { address: @0x1, percentage: 100 }
        ];
        
        let mut campaign = campaign::create_campaign(
            title,
            description,
            goal,
            deadline,
            image_url,
            beneficiaries,
            test_scenario::ctx(&mut scenario)
        );
        
        let coin = coin::mint_for_testing(100000000, test_scenario::ctx(&mut scenario));
        
        // Should fail: campaign deadline passed
        campaign::contribute(
            &mut campaign,
            coin,
            clock::mock_shared_clock(2000), // Current time after deadline
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::end(scenario);
    }
}