import path from 'node:path';
import { color, generateProjectName } from '@astrojs/cli-kit';
import { info, log, title } from '../messages.js';
import type { Context } from './context.js';

import { isEmpty, toValidName } from './shared.js';

export async function projectName(
	ctx: Pick<Context, 'yes' | 'dryRun' | 'prompt' | 'projectName' | 'exit'> & { cwd?: string },
) {
	await checkCwd(ctx.cwd);

	if (!ctx.cwd || !isEmpty(ctx.cwd)) {
		if (ctx.cwd && !isEmpty(ctx.cwd)) {
			await info('Hmm...', `${color.reset(`"${ctx.cwd}"`)}${color.dim(` is not empty!`)}`);
		}

		if (ctx.yes) {
			ctx.projectName = generateProjectName();
			ctx.cwd = `./${ctx.projectName}`;
			await info('dir', `Project created at ./${ctx.projectName}`);
			return;
		}

		const { name } = await ctx.prompt({
			name: 'name',
			type: 'text',
			label: title('dir'),
			message: 'Where should we create your new project?',
			initial: `./${generateProjectName()}`,
			validate(value: string) {
				if (!isEmpty(value)) {
					return `Directory is not empty!`;
				}
				// Check for non-printable characters
				if (value.match(/[^\x20-\x7E]/g) !== null)
					return `Invalid non-printable character present!`;
				return true;
			},
		});

		ctx.cwd = name!.trim();
		ctx.projectName = toValidName(getNameFromPath(ctx.cwd));
		if (ctx.dryRun) {
			await info('--dry-run', 'Skipping project naming');
			return;
		}
	} else {
		ctx.projectName = toValidName(getNameFromPath(ctx.cwd));
	}

	if (!ctx.cwd) {
		ctx.exit(1);
	}
}

/**
 * Returns the package name implied by a project directory: the last path segment,
 * the current directory name for `.`, or the input unchanged if it is a scoped
 * package name like `@scope/name`.
 */
function getNameFromPath(dir: string) {
	if (dir === '.' || dir === './') {
		const parts = process.cwd().split(path.sep);
		return parts[parts.length - 1];
	}
	if (/^@[^/\\]+\/[^/\\]+$/.test(dir)) return dir;
	const parts = dir.split(/[/\\]/).filter(Boolean);
	return parts[parts.length - 1] ?? dir;
}

async function checkCwd(cwd: string | undefined) {
	const empty = cwd && isEmpty(cwd);
	if (empty) {
		log('');
		await info('dir', `Using ${color.reset(cwd)}${color.dim(' as project directory')}`);
	}

	return empty;
}
