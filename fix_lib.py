import re

content = open('C:/Users/cyber/Hyperion/programs/hyperion/src/lib.rs', 'r').read()

# Check current state
if 'let fee_bps = ctx.accounts.protocol.fee_bps;' in content:
    print('lock function already has the fix for fee_bps extraction')
else:
    print('Need to update lock function')

# Fix vault_seeds - replace vault.underlying_mint with underlying_mint in function body
# But be careful not to replace in account constraints

# Replace in the signer seeds sections only (inside function bodies)
content = re.sub(
    r'b"vault",\s*\n\s*vault\.underlying_mint\.as_ref\(\),\s*\n\s*&\[vault\.bump\]',
    'b"vault".as_ref(),\n            underlying_mint.as_ref(),\n            &[vault_bump]',
    content
)

# Fix vault total_deposited references at end of functions
content = re.sub(
    r'vault\.total_deposited = vault\.total_deposited\s*\n\s*\.checked_add',
    'ctx.accounts.vault.total_deposited = current_deposited\n            .checked_add',
    content
)

content = re.sub(
    r'vault\.total_deposited = vault\.total_deposited\s*\n\s*\.checked_sub',
    'ctx.accounts.vault.total_deposited = current_deposited\n            .checked_sub',
    content
)

open('C:/Users/cyber/Hyperion/programs/hyperion/src/lib.rs', 'w').write(content)
print('Applied fixes')
