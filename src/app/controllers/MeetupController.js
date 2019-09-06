import * as Yup from 'yup';
import { parseISO } from 'date-fns';
import Meetup from '../models/Meetup';

class MeetupController {
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

    const meetup = await Meetup.create({
      description,
      location,
      datehour: parsedDate,
      banner_id,
      user_id: req.userId,
    });

    return res.json(meetup);
  }
}

export default new MeetupController();
