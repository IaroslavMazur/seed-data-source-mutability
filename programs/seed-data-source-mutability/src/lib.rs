use anchor_lang::prelude::*;

declare_id!("JPzMSuJhdRAQVprukEXm4tkjXa6BHuhsqtaBQbU6e6R");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod seed_data_source_mutability {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.data_pda.bump = ctx.bumps.data_pda;
        ctx.accounts.data_pda.a_number = 0;
        Ok(())
    }

    pub fn prepare_for_action(ctx: Context<PrepareForAction>) -> Result<()> {
        ctx.accounts.random_pda.bump = ctx.bumps.random_pda;
        Ok(())
    }

    pub fn perform_action(ctx: Context<PerformAction>) -> Result<()> {
        ctx.accounts.data_pda.a_number += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = ANCHOR_DISCRIMINATOR_SIZE + DataPda::INIT_SPACE,
        seeds = [b"data_pda".as_ref()],
        bump
    )]
    pub data_pda: Box<Account<'info, DataPda>>,

    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct PrepareForAction<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        seeds = [b"data_pda".as_ref()],
        bump = data_pda.bump
    )]
    pub data_pda: Box<Account<'info, DataPda>>,

    #[account(
        init_if_needed,
        payer = signer,
        space = ANCHOR_DISCRIMINATOR_SIZE + RandomPda::INIT_SPACE,
        seeds = [b"random_pda",
                 data_pda.a_number.to_le_bytes().as_ref()],
        bump,
    )]
    pub random_pda: Account<'info, RandomPda>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PerformAction<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,

    #[account(
        // Note: the tests fail when this account is mutable - 
        // and execute successfully when you comment the line below:
        mut,
        seeds = [b"data_pda".as_ref()],
        bump = data_pda.bump
    )]
    pub data_pda: Box<Account<'info, DataPda>>,

    #[account(
        mut,
        seeds = [b"random_pda",
                 data_pda.a_number.to_le_bytes().as_ref()],
        bump = random_pda.bump,
    )]
    pub random_pda: Account<'info, RandomPda>,
}

#[account]
#[derive(InitSpace)]
pub struct DataPda {
    pub a_number: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct RandomPda {
    pub bump: u8,
}
