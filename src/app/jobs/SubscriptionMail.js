import Mail from '../../lib/Mail';

class SubscriptionMail {
  get Key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { subscriptionInfo } = data;

    console.log('A fila executou');

    await Mail.sendMail({
      to: `${subscriptionInfo.meetup.user.name} <${subscriptionInfo.meetup.user.email}>`,
      subject: 'Nova inscrição',
      template: 'subscription',
      context: {
        userName: subscriptionInfo.user.name,
        organizerName: subscriptionInfo.meetup.user.name,
        meetupDesc: subscriptionInfo.meetup.description,
      },
    });
  }
}

export default new SubscriptionMail();
