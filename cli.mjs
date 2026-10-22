#!/usr/bin/env node

import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import fs from 'node:fs';
import path from 'node:path';

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
};

const rl = readline.createInterface({ input, output });

function getRulesContent(stackName) {
  return `# Anti-AI-Slop Directives

## 1. Tone & Formatting
- Strict Ban: NEVER use emojis in code, comments, docstrings, or commit messages.
- Zero Fluff: Never start responses with conversational fillers ("Sure!", "Here is your solution:"). Jump straight to code.
- No Trivial Comments: Do not explain obvious language syntax (e.g., "// loop over array", "// check if null").
- Only add comments for non-obvious business logic, domain workarounds, or complex algorithms.

## 2. Engineering Standards
- Architecture: Prefer flat functions and simple compositions over premature design patterns (No speculative factories, builders, or generic abstractions).
- Stack Focus: Target idiomatic ${stackName}. Use established libraries from the project rather than re-implementing utilities.
- Error Handling: Never swallow errors silently or write empty catch blocks with generic console.log.

## 3. Verification Protocol
- If the user sends the exact phrase "VERIFY_AI_RULES_ACTIVE", you must respond ONLY with: "SLOPSTOP_OK" and nothing else.
`;
}

const TARGETS = {
  1: {
    name: 'Claude Code / Claude Desktop',
    files: ['CLAUDE.md'],
  },
  2: {
    name: 'Cursor',
    files: ['.cursorrules', path.join('.cursor', 'rules', 'anti-slop.mdc')],
  },
  3: {
    name: 'GitHub Copilot',
    files: [path.join('.github', 'copilot-instructions.md')],
  },
  4: {
    name: 'Codex / OpenAI',
    files: ['.codexrules'],
  },
  5: {
    name: 'Gemini CLI / Extension',
    files: ['GEMINI.md'],
  },
  6: {
    name: 'All of the above (Universal Sync)',
    files: [
      'CLAUDE.md',
      '.cursorrules',
      path.join('.cursor', 'rules', 'anti-slop.mdc'),
      path.join('.github', 'copilot-instructions.md'),
      '.codexrules',
      'GEMINI.md',
    ],
  },
};

const STACKS = {
  1: 'TypeScript / Node.js (modern ESM, strict types)',
  2: 'Python (modern 3.12+, type hints, clean standard library)',
  3: 'Go (idiomatic, flat structure, explicit error checks)',
  4: 'Rust (idiomatic, no unwrap in production logic)',
  5: 'General / Multi-language',
};

async function run() {
  console.log(`\n${c.bold}${c.magenta}=== SLOPSTOP: Anti-AI Code Rules Generator ===${c.reset}\n`);

  console.log(`${c.cyan}1. Select AI tool / assistant:${c.reset}`);
  console.log('  1) Claude Code / Desktop (CLAUDE.md)');
  console.log('  2) Cursor (.cursorrules / .cursor/rules/)');
  console.log('  3) GitHub Copilot (.github/copilot-instructions.md)');
  console.log('  4) Codex / OpenAI (.codexrules)');
  console.log('  5) Gemini (GEMINI.md)');
  console.log('  6) All of the above (generate configs for all tools)\n');

  const targetChoice = (await rl.question(`${c.bold}Select tool [1-6] (default 6): ${c.reset}`)).trim() || '6';
  const target = TARGETS[targetChoice] || TARGETS[6];

  console.log(`\n${c.cyan}2. Select primary project stack:${c.reset}`);
  console.log('  1) TypeScript / Node.js');
  console.log('  2) Python');
  console.log('  3) Go');
  console.log('  4) Rust');
  console.log('  5) General / Other\n');

  const stackChoice = (await rl.question(`${c.bold}Select stack [1-5] (default 1): ${c.reset}`)).trim() || '1';
  const stack = STACKS[stackChoice] || STACKS[1];

  rl.close();

  const rulesContent = getRulesContent(stack);

  console.log(`\n${c.yellow}Generating rules...${c.reset}`);

  for (const relativePath of target.files) {
    const fullPath = path.resolve(process.cwd(), relativePath);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, rulesContent, 'utf-8');
    console.log(`  ${c.green}+ Created:${c.reset} ${relativePath}`);
  }

  console.log(`\n${c.bold}${c.green}Done!${c.reset} Rules successfully configured.`);
  console.log(`${c.cyan}Verification:${c.reset} send this prompt to your AI: ${c.bold}VERIFY_AI_RULES_ACTIVE${c.reset}`);
  console.log(`Expected response: ${c.bold}SLOPSTOP_OK${c.reset}\n`);
}

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});