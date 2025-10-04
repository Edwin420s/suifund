/// # SuiFund NFT Module
/// 
/// This module handles Supporter NFT functionality including:
/// - NFT minting for campaign contributors
/// - NFT metadata and benefit tracking
/// - NFT transfer functionality
/// - Event emission for NFT actions

module suifund::nft {
    use std::string::{String, utf8};
    use std::vector;
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::url::{Self, Url};

    /// Supporter NFT representing campaign contribution
    struct SupporterNFT has key, store {
        id: UID,
        campaign_id: ID,          /// Associated campaign ID
        contributor: address,
        amount: u64,
        timestamp: u64,
        image_url: Url,
        tier: String,
        benefits: vector<String>
    }

    /// Mints a new Supporter NFT for a campaign contributor
    public fun mint_supporter_nft(
        campaign_id: ID,
        contributor: address,
        amount: u64,
        timestamp: u64,
        image_url: vector<u8>,
        tier: vector<u8>,
        benefits: vector<vector<u8>>,
        ctx: &mut TxContext
    ): SupporterNFT {
        let mut benefits_vec: vector<String> = vector::empty();
        let mut remaining = benefits;
        // Convert benefits to String vector by consuming the input vector
        while (vector::length(&remaining) > 0) {
            let benefit_bytes = vector::pop_back(&mut remaining);
            vector::push_back(&mut benefits_vec, utf8(benefit_bytes));
        };

        let tier_str = utf8(tier);

        let nft = SupporterNFT {
            id: object::new(ctx),
            campaign_id,
            contributor,
            amount,
            timestamp,
            image_url: url::new_unsafe_from_bytes(image_url),
            tier: tier_str,
            benefits: benefits_vec
        };

        // Emit minting event
        sui::event::emit(NFTMinted {
            nft_id: object::id(&nft),
            campaign_id,
            contributor,
            amount,
            tier: nft.tier
        });

        nft
    }

    /// Transfers NFT to another address
    public entry fun transfer_nft(
        nft: SupporterNFT,
        recipient: address,
        ctx: &mut TxContext
    ) {
        transfer::transfer(nft, recipient);
    }

    /// Returns NFT information for external queries
    public fun get_nft_info(nft: &SupporterNFT): (ID, address, u64, u64, String, vector<String>) {
        (
            nft.campaign_id,
            nft.contributor,
            nft.amount,
            nft.timestamp,
            nft.tier,
            nft.benefits
        )
    }
}