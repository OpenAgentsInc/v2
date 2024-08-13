import { EmailTemplate } from '@/components/email/email-template';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Chris at OpenAgents <chris@openagents.com>',
            to: ['kikidesignsfun@gmail.com'],
            cc: ['chris+email@openagents.com'],
            subject: 'I love you',
            react: EmailTemplate({ firstName: 'Kiki' }),
        });

        if (error) {
            return Response.json({ error }, { status: 500 });
        }

        return Response.json(data);
    } catch (error) {
        return Response.json({ error }, { status: 500 });
    }
}

