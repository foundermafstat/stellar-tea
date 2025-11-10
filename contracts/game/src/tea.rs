use soroban_sdk::{contracttype, String, Vec};

#[derive(Clone)]
#[contracttype]
pub struct TeaStats {
    pub sweetness: u32,
    pub body: u32,
    pub caffeine: u32,
}

#[derive(Clone)]
#[contracttype]
pub struct TeaMetadata {
    pub display_name: String,
    pub flavor_profile: String,
    pub rarity: u32,
    pub level: u32,
    pub infusion: String,
    pub stats: TeaStats,
    pub lineage: Vec<u64>,
    pub image_uri: String,
}
