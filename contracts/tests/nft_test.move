#[test_only]
module suifund::nft_test {
    use sui::test_scenario;
    use sui::tx_context;
    use suifund::nft;

    #[test]
    fun test_mint_nft() {
        let scenario = test_scenario::begin(@0x0);
        let admin = test_scenario::next_ts(&mut scenario);
        
        let campaign_id = sui::object::new_id(@0x1);
        let contributor = @0x2;
        let amount = 1000000000;
        let timestamp = 1234567890;
        let image_url = b"https://example.com/nft.jpg";
        let tier = b"Gold";
        let benefits = vector[b"Early Access", b"VIP Support"];
        
        let nft = nft::mint_supporter_nft(
            campaign_id,
            contributor,
            amount,
            timestamp,
            image_url,
            tier,
            benefits,
            test_scenario::ctx(&mut scenario)
        );
        
        let (actual_campaign_id, actual_contributor, actual_amount, actual_timestamp, actual_tier, actual_benefits) = 
            nft::get_nft_info(&nft);
        
        assert!(actual_campaign_id == campaign_id, 0);
        assert!(actual_contributor == contributor, 1);
        assert!(actual_amount == amount, 2);
        assert!(actual_tier == "Gold", 3);
        assert!(vector::length(&actual_benefits) == 2, 4);
        
        test_scenario::end(scenario);
    }
}