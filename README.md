# pi-cloak-secrets

Secret masking extension for [pi](https://pi.dev). Automatically hides sensitive values in files before they are sent to the AI.

Inspired by the secret masking setup in [dmmulroy/.dotfiles](https://github.com/dmmulroy/.dotfiles/).

## How it works

`pi-cloak-secrets` intercepts `read` tool results and applies regex-based cloaking rules to mask secrets. The model and UI never see the real values — only the masked versions.

## Install

```bash
pi install npm:pi-cloak-secrets
```

Or try it without installing:

```bash
pi -e npm:pi-cloak-secrets
```

## Configuration

Works out of the box — no config file required. To customize, create `~/.pi/agent/cloak.json`:

```json
{
  "enabled": true,
  "cloakCharacter": "*",
  "cloakLength": null,
  "tryAllPatterns": true,
  "patterns": [
    {
      "filePattern": "**/*.env*",
      "cloakPattern": "(=).+",
      "replace": "$1"
    },
    {
      "filePattern": "**/*.vars*",
      "cloakPattern": "(=).+",
      "replace": "$1"
    },
    {
      "filePattern": "**/*auth.json",
      "cloakPattern": {
        "pattern": "(\"(?:token|apiKey|secret|password)\"\\s*:\\s*\")[^\"]+",
        "replace": "$1"
      }
    }
  ]
}
```

If you define `patterns` in `cloak.json`, they replace the built-in defaults. If you omit `patterns`, the built-in defaults stay active.

### Built-in defaults

Ships with sensible defaults covering the most common secret files:

- `.env*` and `.vars*` — masks everything after `=`
- `*.opencode.json` and `opencode.json` — masks `apiKey` values
- `config.toml` — masks `token = ...` values
- `*.json` / `*.jsonc` — masks Cloudflare Access tokens (`CLOUDFLARE_ACCESS_TEAM_DOMAIN`, `CLOUDFLARE_ACCESS_AUD`)
- `auth.json` — masks common credential fields (`token`, `apiKey`, `secret`, `password`, `accessToken`, `refreshToken`, `clientSecret`, `idToken`, `sessionToken`, `authorization`)

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `enabled` | `boolean` | Toggle cloaking globally |
| `cloakCharacter` | `string` | Character used for masking (default `*`) |
| `cloakLength` | `number \| null` | Fixed mask length; `null` preserves original length |
| `tryAllPatterns` | `boolean` | If `true`, all matching patterns run; if `false`, stops at first match |
| `patterns` | `array` | Cloaking rules |

### Pattern format

Each rule has:
- `filePattern` — glob(s) matching file paths (e.g. `**/*.env*`, `~/.config/secrets`)
- `cloakPattern` — regex(s) with capture groups to preserve the key/label, replace the value
- `replace` — optional replacement template (e.g. `$1` to keep the first capture group)

`cloakPattern` supports string regex or an object with `pattern`, `replace`, and `flags`.

## Commands

- `/cloak-status` — Show current config status and loaded pattern count

## Why this exists

- Prevents accidental credential leakage in AI context
- Keeps `.env` files safe when the agent reads project configs
- Lets you share agent sessions without redacting secrets manually
