use soroban_sdk::{contracttype, Address, Env};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    GameOperator,
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&DataKey::Admin, admin);
}

pub fn get_admin(env: &Env) -> Address {
    env.storage()
        .instance()
        .get::<DataKey, Address>(&DataKey::Admin)
        .expect("admin not initialized")
}

pub fn require_admin(env: &Env) -> Address {
    let admin = get_admin(env);
    admin.require_auth();
    admin
}

pub fn set_game_operator(env: &Env, operator: &Address) {
    require_admin(env);
    env.storage()
        .instance()
        .set(&DataKey::GameOperator, operator);
}

pub fn get_game_operator(env: &Env) -> Option<Address> {
    env.storage()
        .instance()
        .get::<DataKey, Address>(&DataKey::GameOperator)
}

pub fn require_operator_or_admin(env: &Env, invoker: &Address) -> Address {
    if let Some(game_operator) = get_game_operator(env) {
        if invoker == &game_operator {
            invoker.require_auth();
            return invoker.clone();
        }
    }
    require_admin(env)
}
