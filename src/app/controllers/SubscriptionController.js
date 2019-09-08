import { isBefore } from 'date-fns';
import { Op } from 'sequelize';

import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';
import Queue from '../../lib/Queue'; // Fila
import SubscriptionMail from '../jobs/SubscriptionMail';

class SubscriptionController {
  async index(req, res) {
    const meetups = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          where: {
            datehour: {
              [Op.gt]: new Date(),
            },
          },
        },
      ],
      order: [['meetup', 'datehour']],
    });
    return res.json(meetups);
  }

  async store(req, res) {
    const meetup = await Meetup.findByPk(req.params.meetupId);

    if (!meetup) {
      return res.status(400).json('Meetup não existe');
    }

    if (meetup.user_id === req.userId) {
      return res.status(400).json({
        error:
          'Usuário não pode se inscrever em um meetup organizado por ele mesmo',
      });
    }

    if (isBefore(meetup.datehour, new Date())) {
      return res.status(401).json({ error: 'Meetup já aconteceu' });
    }

    const checkSubscription = await Subscription.findOne({
      where: {
        user_id: req.userId,
        meetup_id: meetup.id,
      },
    });

    if (checkSubscription) {
      return res
        .status(401)
        .json({ error: 'Usuário já se cadastrou neste meetup' });
    }

    const checkDate = await Subscription.findOne({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          required: true,
          where: {
            datehour: meetup.datehour,
          },
        },
      ],
    });

    if (checkDate) {
      return res.status(401).json({
        error:
          'Não é possível se inscrever em mais de um meetup para a mesma data/hora',
      });
    }

    const subscription = await Subscription.create({
      user_id: req.userId,
      meetup_id: req.params.meetupId,
    });

    /**
     * Email
     */
    const subscriptionInfo = await Subscription.findOne({
      where: {
        id: subscription.id,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          include: {
            model: User,
            as: 'user',
          },
        },
        {
          model: User,
          as: 'user',
        },
      ],
    });

    await Queue.add(SubscriptionMail.key, {
      subscriptionInfo,
    });

    return res.json(subscriptionInfo);
  }
}

export default new SubscriptionController();
