import {
	HttpStatusCode,
	IModify,
	IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import {
	ApiEndpoint,
	IApiEndpointInfo,
	IApiRequest,
	IApiResponse,
} from '@rocket.chat/apps-engine/definition/api';
import { safeTypedJSONParse } from '../lib/Utils';
import { IWebhookNotification } from '../models/IWebhookNotification';

export class Webhook extends ApiEndpoint {
	public path = 'webhook';

	public async post(
		request: IApiRequest,
		endpoint: IApiEndpointInfo,
		read: IRead,
		modify: IModify,
	): Promise<IApiResponse> {
        const { content, query } = request;

        const { roomId } = query;

        const room = await read.getRoomReader().getById(roomId);
        if (!room) {
            return this.success({
                status: false,
                message: 'Room not found',
            });
        }

        const appUser = await read.getUserReader().getAppUser(this.app.getID());
        if (!appUser) {
            throw new Error('App user not found');
        }

        const notification = safeTypedJSONParse<IWebhookNotification>(content);
        if (!notification) {
            return this.json({
                status: HttpStatusCode.BAD_REQUEST,
                content: {
                    error: 'Invalid notification',
                }
            })
        }

        const { incident } = notification;
        if (!incident) {
            // Ignore non-incident notification
            return this.success();
        }

        const { incident_updates, affected_components, url: incidentUrl, name } = incident;

        if (!incident_updates || !incident_updates.length) {
            return this.json({
                status: HttpStatusCode.BAD_REQUEST,
                content: {
                    error: 'Incident has no updates',
                }
            })
        }

        const latestIncidentUpdate = incident_updates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        const { markdown, status } = latestIncidentUpdate;

        const block = modify.getCreator().getBlockBuilder();

        block.addSectionBlock({
            text: block.newMarkdownTextObject(`*${name}*`),
        });

        block.addSectionBlock({
            text: block.newMarkdownTextObject(`[${status}] ${markdown}`),
        });

        if (affected_components && affected_components.length) {
            const affectedComponents = affected_components.map(({ name, status }) => `${name} (${status})`).join(', ');
            block.addSectionBlock({
                text: block.newMarkdownTextObject(`Affected components: ${affectedComponents}`),
            });
        }

        block.addActionsBlock({
            elements: [
                block.newButtonElement({
                    text: block.newPlainTextObject('View Incident'),
                    url: incidentUrl,
                })
            ],
        });

        const msg =  modify.getCreator().startMessage().setRoom(room).setBlocks(block.getBlocks()).setSender(appUser);
        await modify.getCreator().finish(msg);

		return this.json({
			status: HttpStatusCode.OK,
			content: {
				success: true,
			},
		});
	}
}
