import {
    IAppAccessors,
    IConfigurationExtend,
    ILogger,
} from '@rocket.chat/apps-engine/definition/accessors';
import { ApiVisibility, ApiSecurity } from '@rocket.chat/apps-engine/definition/api';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { InStatusSlashCommand } from './commands/Instatus';
import { Webhook } from './endpoints/Webhook';

export class InStatusApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    protected async extendConfiguration(
		configuration: IConfigurationExtend,
	): Promise<void> {

		await configuration.api.provideApi({
			visibility: ApiVisibility.PRIVATE,
			security: ApiSecurity.UNSECURE,
			endpoints: [
				new Webhook(this),
			],
		});

        await configuration.slashCommands.provideSlashCommand(new InStatusSlashCommand(this));
    }
}
