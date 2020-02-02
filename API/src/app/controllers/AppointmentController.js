import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';
import Mail from '../../lib/Mail';

class AppointmentController {
  async index(req, res) {
    // paginaçao
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date'],
      // mosntando 20 itens por gagina
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });
    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Valitation fails' });
    }

    const { provider_id, date } = req.body;

    // checar se o usuario e provider

    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res
        .status(401)
        .json({ eror: 'you can only create appointments with providers' });
    }

    // arendodar minutos com a hora ex 19:34 vai passar a asr 19:00
    const hourStart = startOfHour(parseISO(date));

    // verificar se a tada e anterior a data atual
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not premitted' });
    }

    // verificar se a data esta ocupada
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      return res
        .status(400)
        .json({ error: 'Appontment date is not avalible ' });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart,
    });

    // notificar prestador de servico
    const user = await User.findByPk(req.userId);
    const formatteDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às ' H:mm'h'",
      { locale: pt }
    );

    await Notification.create({
      content: `Novo agendamento de ${user.name} para dia ${formatteDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req,res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        }
      ]
    });

    //verificacao se o usuario e o dono da marcacao
    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error:"You don't have permission to cancel this appointment. "
      });
    }
    //tirando 2 horas do horario inicial ,
    //pois so pode cancelar com duas horas de antecedencia

    const dateWithSub = subHours(appointment.date, -2);

    if(isBefore(dateWithSub, new Date())) {
        return res.status(401).json({
          error:'You can only cancel appointments 2 hours in advance '
        });
    }

    appointment.canceled_at = new Date();

    await  appointment.save();

    await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'Agendamento cancelado',
      text: 'Voce tem um novo cancelamento',
    })

    return res.json(appointment);
  }
}
export default new AppointmentController();
