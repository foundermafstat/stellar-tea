use soroban_sdk::{contracttype, Address, Env};

#[derive(Clone)]
#[contracttype]
pub struct Config {
    pub admin: Address,
    pub treasury: Address,
    pub balls_token: Address,
    pub stars_token: Address,
    pub tea_nft: Address,
    pub dex: Option<Address>,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Config,
    DailyEmissionCap,
}

pub fn init(
    env: &Env,
    admin: &Address,
    treasury: &Address,
    balls_token: &Address,
    stars_token: &Address,
    tea_nft: &Address,
    dex: &Option<Address>,
) {
    let config = Config {
        admin: admin.clone(),
        treasury: treasury.clone(),
        balls_token: balls_token.clone(),
        stars_token: stars_token.clone(),
        tea_nft: tea_nft.clone(),
        dex: dex.clone(),
    };
    env.storage().instance().set(&DataKey::Config, &config);
}

pub fn require_admin(env: &Env) -> Address {
    let admin = get(env).admin;
    admin.require_auth();
    admin
}

pub fn get(env: &Env) -> Config {
    env.storage()
        .instance()
        .get::<DataKey, Config>(&DataKey::Config)
        .expect("config not set")
}

pub fn update_treasury(env: &Env, treasury: Address) {
    require_admin(env);
    let mut config = get(env);
    config.treasury = treasury.clone();
    env.storage().instance().set(&DataKey::Config, &config);
    env.events().publish(("treasury_updated",), (treasury,));
}

pub fn set_daily_cap(env: &Env, amount: i128) {
    require_admin(env);
    env.storage()
        .instance()
        .set(&DataKey::DailyEmissionCap, &amount);
}

pub fn daily_cap(env: &Env) -> Option<i128> {
    env.storage()
        .instance()
        .get::<DataKey, i128>(&DataKey::DailyEmissionCap)
}
