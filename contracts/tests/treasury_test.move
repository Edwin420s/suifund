#[test_only]
module suifund::treasury_test {
    use sui::test_scenario;
    use sui::coin;
    use sui::sui;
    use suifund::treasury;

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
}