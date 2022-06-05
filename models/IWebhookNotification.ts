export interface IWebhookNotification {
    meta: {
        unsubscribe: string;
        documentation: string;
    }
    page: {
        id: string;
        status_indicator: string;
        status_description: string;
        url: string;
    },
    incident: {
        name: string;
        id: string;
        status: string;
        created_at: string;
        url: string;
        incident_updates: [
            {
                status: string;
                body: string;
                markdown: string;
                created_at: string;
                updated_at: string;
            }
        ],
        affected_components: {
            id: string;
            name: string;
            status: string;
        }[];
    },
}
