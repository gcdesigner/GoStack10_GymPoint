import HelpOrder from '../models/HelpOrder';

import HelpOrderAnswerMail from '../jobs/HelpOrderAnswerMail';
import Queue from '../../lib/Queue';

import Student from '../models/Student';

class HelpOrderController {
  async index(req, res) {
    const help_orders = await HelpOrder.findAll({
      // where: { answer: null },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
      ],
    });
    return res.json(help_orders);
  }

  async show(req, res) {
    const { id } = req.params;
    const help_orders = await HelpOrder.findAll({
      where: { student_id: id },
    });
    return res.json(help_orders);
  }

  async detail(req, res) {
    const { id, idAnswer } = req.params;
    const help_order = await HelpOrder.findOne({
      where: { student_id: id, id: idAnswer },
    });
    return res.json(help_order);
  }

  async store(req, res) {
    const { id } = req.params;
    const help_order = await HelpOrder.create({
      student_id: id,
      question: req.body.question,
    });

    return res.json(help_order);
  }

  async update(req, res) {
    const { id } = req.params;

    const help_order = await HelpOrder.findOne({
      where: { id },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    const { answer } = await help_order.update({
      answer: req.body.answer,
      answer_at: new Date(),
    });

    await Queue.add(HelpOrderAnswerMail.key, {
      name: help_order.student.name,
      email: help_order.student.email,
      question: help_order.question,
      answer,
    });

    return res.json(help_order);
  }

  async delete(req, res) {
    const { id } = req.params;
    const order = await HelpOrder.findOne({ where: { id } });
    await order.destroy();

    return res.json(order);
  }
}

export default new HelpOrderController();
