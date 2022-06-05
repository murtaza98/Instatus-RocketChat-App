import { IModify, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IMessageAttachment } from "@rocket.chat/apps-engine/definition/messages";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { BlockBuilder } from "@rocket.chat/apps-engine/definition/uikit";
import { InStatusApp } from "../InStatusApp";

export const safeTypedJSONParse = <T>(json: string | object): T | undefined => {
	try {
		return JSON.parse(typeof json === 'string' ? json : JSON.stringify(json));
	} catch (e) {
		return;
	}
};

export const getServerSettingValue = async (read: IRead, id: string) => {
	return id && (await read.getEnvironmentReader().getServerSettings().getValueById(id));
}

export const sendRoomMessage = async (
	app: InStatusApp,
	read: IRead,
	modify: IModify,
	room: IRoom,
	text?: string,
	attachments?: Array<IMessageAttachment>,
	blocks?: BlockBuilder,
): Promise<void> => {
    const appUser = await read.getUserReader().getAppUser(app.getID());
    if (!appUser) {
        throw new Error('App user not found');
    }
	const msg = modify.getCreator().startMessage().setGroupable(false).setSender(appUser).setRoom(room);

	text && text.length && msg.setText(text);

	attachments && attachments.length > 0 && msg.setAttachments(attachments);

	blocks && msg.setBlocks(blocks);

	await modify.getCreator().finish(msg);
};
