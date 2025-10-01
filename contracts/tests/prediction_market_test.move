#[test_only]
module suifund::prediction_market_test {
    use sui::test_scenario;
    use sui::clock;
    use sui::coin;
    use sui::sui;
    use suifund::prediction_market;

    #[test]
    fun test_create_market() {
        let scenario = test_scenario::begin(@0x0);
        let admin = test_scenario::next_ts(&mut scenario);
        
        let campaign_id = sui::object::new_id(@0x1);
        let question = b"Will this campaign succeed?";
        let resolution_time = 1735689600000; // Future date
        
        let market = prediction_market::create_market(
            campaign_id,
            question,
            resolution_time,
            test_scenario::ctx(&mut scenario)
        );
        
        let (actual_campaign_id, actual_question, actual_creator, _, _, _, actual_resolution_time, actual_outcome, actual_resolved) = 
            prediction_market::get_market_info(&market);
        
        assert!(actual_campaign_id == campaign_id, 0);
        assert!(actual_question == "Will this campaign succeed?", 1);
        assert!(actual_creator == admin, 2);
        assert!(actual_outcome == prediction_market::OUTCOME_UNRESOLVED, 3);
        assert!(!actual_resolved, 4);
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_place_bet() {
        let scenario = test_scenario::begin(@0x0);
        let admin = test_scenario::next_ts(&mut scenario);
        let better = test_scenario::next_ts(&mut scenario);
        
        let campaign_id = sui::object::new_id(@0x1);
        let question = b"Test Market";
        let resolution_time = 1735689600000;
        
        let mut market = prediction_market::create_market(
            campaign_id,
            question,
            resolution_time,
            test_scenario::ctx(&mut scenario)
        );
        
        let coin = coin::mint_for_testing(1000000000, test_scenario::ctx(&mut scenario)); // 1 SUI
        
        prediction_market::place_bet(
            &mut market,
            prediction_market::OUTCOME_YES,
            coin,
            clock::mock_shared_clock(0),
            test_scenario::ctx(&mut scenario)
        );
        
        let (_, _, _, total_bets, yes_bets, no_bets, _, _, _) = 
            prediction_market::get_market_info(&market);
        
        assert!(total_bets == 1000000000, 0);
        assert!(yes_bets == 1000000000, 1);
        assert!(no_bets == 0, 2);
        
        test_scenario::end(scenario);
    }
}