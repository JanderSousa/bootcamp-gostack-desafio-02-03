import * as Yup from 'yup';
import { parseISO, isBefore } from 'date-fns';
import Meetup from '../models/Meetup';

class MeetupController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: {
        user_id: req.userId,
      },
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
      location: Yup.string().required(),
      datehour: Yup.string().required(),
      banner_id: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body, schema))) {
      res.status(400).json({ error: 'Falha na validação' });
    }

    const { description, location, datehour, banner_id } = req.body;
    const parsedDate = parseISO(datehour);

    if (isBefore(parsedDate, new Date())) {
      return res
        .status(401)
        .json({ error: 'Data não pode ser menor que a atual' });
    }

    try {
      const meetup = await Meetup.create({
        description,
        location,
        datehour: parsedDate,
        banner_id,
        user_id: req.userId,
      });

      return res.json(meetup);
    } catch (err) {
      return res.json(err);
    }
  }

  async update(req, res) {
    try {
      const meetup = await Meetup.findOne({
        where: {
          id: req.params.id,
          user_id: req.userId,
        },
      });
      if (!meetup) {
        return res.status(401).json({ error: 'Meetup não existe' });
      }

      if (isBefore(meetup.datehour, new Date())) {
        return res.status(401).json({ error: 'Meetup já aconteceu' });
      }

      if (req.body.datehour) {
        const parsedDate = parseISO(req.body.datehour);
        if (isBefore(parsedDate, new Date())) {
          return res
            .status(401)
            .json({ error: 'Data não pode ser menor que a atual' });
        }
      }

      const upMeetup = await meetup.update(req.body);

      return res.json(upMeetup);
    } catch (err) {
      return res.json(err);
    }
  }

  async delete(req, res) {
    const meetup = await Meetup.findOne({
      where: {
        id: req.params.id,
        user_id: req.userId,
      },
    });
    if (!meetup) {
      return res.status(401).json({ error: 'Meetup não existe' });
    }

    if (isBefore(meetup.datehour, new Date())) {
      return res.status(401).json({ error: 'Meetup já aconteceu' });
    }

    await Meetup.destroy({
      where: {
        id: req.params.id,
      },
    });

    return res.json(meetup);
  }
}

export default new MeetupController();
