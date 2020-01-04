import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

import { Form, Input, Select as RocketSelect } from '@rocketseat/unform';
import * as Yup from 'yup';

import { addMonths, format, startOfDay } from 'date-fns';
import pt from 'date-fns/locale/pt';

import ReactInputMask from '~/components/InputMask';
import DatePicker from '~/components/DatePicker';
import ReactSelect from '~/components/Select';

import api from '~/services/api';

/**
 * Form validation
 */
const schema = Yup.object().shape({
  student_id: Yup.number().required('Campo obrigatório'),
  pack_id: Yup.number().required('Campo obrigatório'),
  start_date: Yup.date()
    .min(startOfDay(new Date()), 'Selecione uma data de hoje em diante')
    .typeError('Insira uma data válida')
    .required('Campo obrigatório'),
});

export default function FormEnroll({ onSubmit, initialData }) {
  /**
   * Component States
   */
  const [students, setStudents] = useState({});
  const [student, setStudent] = useState({});
  const [packs, setPacks] = useState([]);
  const [pack, setPack] = useState(1);
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [endDate, setEndDate] = useState('');
  const [totalPrice, setTotalPrice] = useState('');

  /**
   * Load Students Array
   */
  const loadStudents = useCallback(async () => {
    const response = await api.get('students');
    const data = response.data.map(e => ({
      value: e.id,
      label: e.name,
    }));
    setStudents(data);
  }, []);

  /**
   * Load Packs Array
   */
  const loadPacks = useCallback(async () => {
    const response = await api.get('packs');
    const data = response.data.map(p => ({
      id: p.id,
      title: p.title,
    }));
    setPacks(data);
  }, []);

  /**
   * Init
   */
  useEffect(() => {
    loadStudents();
    loadPacks();
  }, []); // eslint-disable-line

  /**
   * Initial Values on Update
   */
  useEffect(() => {
    if (initialData) {
      setStudent({
        value: initialData.student_id,
        label: initialData.student_name,
      });
      setPack(initialData.pack_id);
      setStartDate(initialData.start_date);
      setEndDate(initialData.end_date);
      setTotalPrice(initialData.totalPrice);
    }
  }, [initialData]);

  /**
   * Calc End Date and Total Price
   */
  useMemo(() => {
    async function calcEndDateAndPrice() {
      const response = await api.get(`packs/${pack}`);

      const calcEndDate = addMonths(startDate, response.data.duration);
      const formatedEndDate = format(calcEndDate, 'dd/MM/yyyy', { locale: pt });
      setEndDate(formatedEndDate);

      const calcTotalPrice = response.data.duration * response.data.price;
      setTotalPrice(calcTotalPrice);
    }

    calcEndDateAndPrice();
  }, [startDate, pack]);

  /**
   * Component HTML
   */
  return (
    <Form
      id="enroll"
      schema={schema}
      onSubmit={onSubmit}
      initialData={initialData}
    >
      <div className="form-group">
        <ReactSelect
          name="student_id"
          label="Aluno"
          options={students}
          placeholder="Buscar aluno"
          value={student}
          onChange={e => setStudent(e)}
          isDisabled={initialData && true}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="pack">Plano</label>
          <RocketSelect
            name="pack_id"
            options={packs}
            placeholder="Selecione o plano"
            value={pack}
            onChange={e => setPack(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="student">Data de início</label>
          <DatePicker
            name="start_date"
            selected={startDate}
            onChange={data => setStartDate(data)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="end_date_formated">Data de término</label>
          <Input name="end_date_formated" disabled value={endDate} />
        </div>

        <div className="form-group">
          <label htmlFor="price">Valor final</label>
          <ReactInputMask
            name="price"
            disabled
            mask="R$ 999,00"
            value={totalPrice}
          />
        </div>
      </div>
    </Form>
  );
}

/**
 * PropTypes
 */
FormEnroll.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.instanceOf(String),
};

FormEnroll.defaultProps = {
  initialData: null,
};
