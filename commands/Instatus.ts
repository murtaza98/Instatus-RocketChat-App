import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { InStatusApp } from '../InStatusApp';
import { getServerSettingValue, sendRoomMessage } from '../lib/Utils';

export class InStatusSlashCommand implements ISlashCommand {
	public command = 'instatus';
	public i18nParamsExample = 'slashcommand_params';
	public i18nDescription = 'slashcommand_description';
	public providesPreview = false;

	constructor(private readonly app: InStatusApp) {}

	public async executor(
		context: SlashCommandContext,
		read: IRead,
		modify: IModify,
		http: IHttp,
		persistence: IPersistence,
	): Promise<void> {
        // resolve webhook url
        const webhookUrlBase = await this.getWebhookUrlBase(read);

        const setupInstruction = `Hi There! To receive updates from InStatus, you need to set up a webhook.
        Here's the Webhook Link for this channel: \`${webhookUrlBase}?roomId=${context.getRoom().id}\``;

        await sendRoomMessage(this.app, read, modify, context.getRoom(), setupInstruction);
	}

    private async getWebhookUrlBase(read: IRead) {
		const serverUrl: string = await getServerSettingValue(read, 'Site_Url');

        const [{ computedPath }] = this.app.getAccessors().providedApiEndpoints;

        return `${serverUrl.replace(/\/$/, '')}${computedPath}`;
    }
}
