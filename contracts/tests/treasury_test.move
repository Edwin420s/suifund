/// # Treasury Module Tests
/// 
/// Test suite for treasury and governance functionality including:
/// - Treasury creation and initialization
/// - Fee collection and tracking
/// - Proposal creation and management

#[test_only]
module suifund::treasury_test {
    use sui::test_scenario;
    use sui::coin;
    use sui::sui;
    use suifund::treasury;

    /// Tests basic treasury creation
    #[test]
    fun test_create_treasury() {
        let scenario = test_scenario::begin(@0x0);
        let admin = test_scenario::next_ts(&mut scenario);
        
        let treasury_obj = treasury::create_treasury(test_scenario::ctx(&mut scenario));
        
        let (total_fees, proposal_count) = treasury::get_treasury_info(&treasury_obj);
        
        assert!(total_fees == 0, 0);
        assert!(proposal_count == 0, 1);
        
        test_scenario::end(scenario);
    }

    /// Tests fee collection functionality
    #[test]
    fun test_collect_fees() {
        let scenario = test_scenario::begin(@0x0);
        let admin = test_scenario::next_ts(&mut scenario);
        
        let mut treasury_obj = treasury::create_treasury(test_scenario::ctx(&mut scenario));
        
        let fees = coin::mint_for_testing(500000000, test_scenario::ctx(&mut scenario)); // 0.5 SUI
        
        treasury::collect_fees(
            &mut treasury_obj,
            fees,
            test_scenario::ctx(&mut scenario)
        );
        
        let (total_fees, _) = treasury::get_treasury_info(&treasury_obj);
        assert!(total_fees == 500000000, 0);
        
        test_scenario::end(scenario);
    }
}