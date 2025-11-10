use soroban_sdk::{contracttype, Address, Env};

use crate::errors::GameError;

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    LastClaim(Address),
}

pub const CLAIM_INTERVAL: u64 = 86_400;

pub fn ensure_claimable(env: &Env, player: &Address) -> Result<(), GameError> {
    let now = env.ledger().timestamp();
    if let Some(last) = env
        .storage()
        .persistent()
        .get::<DataKey, u64>(&DataKey::LastClaim(player.clone()))
    {
        if now.saturating_sub(last) < CLAIM_INTERVAL {
            return Err(GameError::AlreadyClaimed);
        }
    }
    Ok(())
}

pub fn record_claim(env: &Env, player: &Address) {
    let now = env.ledger().timestamp();
    env.storage()
        .persistent()
        .set(&DataKey::LastClaim(player.clone()), &now);
}
