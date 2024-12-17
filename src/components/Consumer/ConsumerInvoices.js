import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Select, DatePicker, Row, Col, Space, Modal, Statistic, Descriptions } from 'antd';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import moment from 'moment';
import api from '../../utils/axios';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ConsumerInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [dateRange, setDateRange] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [servicePricing, setServicePricing] = useState(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    paid: 0,
    pending: 0
  });

  useEffect(() => {
    fetchPricingAndInvoices();
  }, [dateRange, statusFilter]);

  const fetchPricingAndInvoices = async () => {
    try {
      const [pricingResponse] = await Promise.all([
        api.get('/service-pricing/current')
      ]);
      setServicePricing(pricingResponse.data.data);
      fetchInvoices();
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    }
  };

  const calculateAmount = (consumption) => {
    if (!servicePricing || !consumption) return 0;

    const { threshold, base_price, extra_price } = servicePricing;
    
    if (consumption <= threshold) {
      return consumption * base_price;
    }

    const baseAmount = threshold * base_price;
    const extraAmount = (consumption - threshold) * extra_price;
    return baseAmount + extraAmount;
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const [startDate, endDate] = dateRange;
      const response = await api.get('/invoices/consumer', {
        params: {
          start_date: startDate?.format('YYYY-MM-DD'),
          end_date: endDate?.format('YYYY-MM-DD'),
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });

      const invoicesWithCalculatedAmounts = response.data.data.map(invoice => {
        const reading = invoice.meter?.readings?.[0];
        const consumption = reading ? parseFloat(reading.consumption) : 0;
        const amount = calculateAmount(consumption);
        return {
          ...invoice,
          amount_due: amount
        };
      });

      setInvoices(invoicesWithCalculatedAmounts);
      
      // Calculer les statistiques
      const total = invoicesWithCalculatedAmounts.reduce((sum, inv) => sum + parseFloat(inv.amount_due), 0);
      const paid = invoicesWithCalculatedAmounts
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + parseFloat(inv.amount_due), 0);
      const pending = invoicesWithCalculatedAmounts
        .filter(inv => inv.status === 'pending')
        .reduce((sum, inv) => sum + parseFloat(inv.amount_due), 0);
      
      setStatistics({ total, paid, pending });
    } catch (error) {
      console.error('Erreur lors de la récupération des factures:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderConsumptionDetails = (consumption) => {
    if (!servicePricing || !consumption) return null;

    const { threshold, base_price, extra_price } = servicePricing;
    const baseConsumption = Math.min(consumption, threshold);
    const extraConsumption = Math.max(0, consumption - threshold);
    const baseAmount = baseConsumption * base_price;
    const extraAmount = extraConsumption * extra_price;
    const totalAmount = baseAmount + extraAmount;

    return (
      <div style={{ 
        background: '#f9f9f9', 
        padding: '16px', 
        borderRadius: '8px',
        marginTop: '16px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>
          Détails de la tarification :
        </div>
        
        <div style={{ marginBottom: '8px' }}>
          <div>Première tranche (0 à {threshold} m³) à {base_price} FCFA/m³ :</div>
          <div style={{ marginLeft: '15px' }}>
            {baseConsumption.toFixed(2)} m³ × {base_price} = {Math.round(baseAmount).toLocaleString()} FCFA
          </div>
        </div>

        {extraConsumption > 0 && (
          <div style={{ marginBottom: '8px' }}>
            <div>Deuxième tranche (au-delà de {threshold} m³) à {extra_price} FCFA/m³ :</div>
            <div style={{ marginLeft: '15px' }}>
              {extraConsumption.toFixed(2)} m³ × {extra_price} = {Math.round(extraAmount).toLocaleString()} FCFA
            </div>
          </div>
        )}

        <div style={{ 
          marginTop: '12px', 
          paddingTop: '12px',
          borderTop: '1px solid #e8e8e8',
          fontWeight: 'bold'
        }}>
          Total : {Math.round(totalAmount).toLocaleString()} FCFA
        </div>
      </div>
    );
  };

  const handleDownloadInvoice = async (record) => {
    try {
      const response = await api.get(`/invoices/${record.id}/download`, {
        responseType: 'blob'
      });
  
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Facture-${record.invoice_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement de la facture:', error);
      Modal.error({
        title: 'Erreur de téléchargement',
        content: 'Impossible de télécharger la facture. Veuillez réessayer plus tard.'
      });
    }
  };

  const handleViewInvoice = (record) => {
    const reading = record.meter?.readings?.[0];
    const consumption = reading ? parseFloat(reading.consumption) : 0;
    
    Modal.info({
      title: `Détails de la facture ${record.invoice_number}`,
      width: 700,
      content: (
        <div>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Compteur">
              {record.meter?.meter_number}
            </Descriptions.Item>
            <Descriptions.Item label="Période">
              {`${moment(record.start_date).format('DD/MM/YYYY')} au ${moment(record.end_date).format('DD/MM/YYYY')}`}
            </Descriptions.Item>
            <Descriptions.Item label="Ancien Index">
              {reading ? parseFloat(reading.last_reading_value).toFixed(2) : 'N/A'} m³
            </Descriptions.Item>
            <Descriptions.Item label="Nouvel Index">
              {reading ? parseFloat(reading.reading_value).toFixed(2) : 'N/A'} m³
            </Descriptions.Item>
            <Descriptions.Item label="Consommation">
              {reading ? parseFloat(reading.consumption).toFixed(2) : 'N/A'} m³
            </Descriptions.Item>
            <Descriptions.Item label="Date d'échéance">
              {moment(record.due_date).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Statut">
              <Tag color={
                record.status === 'paid' ? 'green' : 
                record.status === 'pending' ? 'orange' : 
                'red'
              }>
                {record.status === 'paid' ? 'Payée' : 
                 record.status === 'pending' ? 'En attente' : 
                 'Non payée'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          {renderConsumptionDetails(consumption)}
        </div>
      ),
    });
  };

  const columns = [
    {
      title: 'N° Facture',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
    },
    {
      title: 'Compteur',
      dataIndex: ['meter', 'meter_number'],
      key: 'meter',
    },
    {
      title: 'Période',
      key: 'period',
      render: (_, record) => (
        `${moment(record.start_date).format('DD/MM/YY')} au ${moment(record.end_date).format('DD/MM/YY')}`
      ),
    },
    {
      title: 'Consommation',
      key: 'consumption',
      render: (_, record) => {
        const reading = record.meter?.readings?.[0];
        return reading ? `${parseFloat(reading.consumption).toFixed(2)} m³` : 'N/A';
      },
    },
    {
      title: 'Montant',
      key: 'amount_due',
      render: (_, record) => {
        const reading = record.meter?.readings?.[0];
        const consumption = reading ? parseFloat(reading.consumption) : 0;
        const amount = calculateAmount(consumption);
        return `${Math.round(amount).toLocaleString()} FCFA`;
      },
    },
    {
      title: 'Échéance',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'paid' ? 'green' : 
          status === 'pending' ? 'orange' : 
          'red'
        }>
          {status === 'paid' ? 'Payée' : 
           status === 'pending' ? 'En attente' : 
           'Non payée'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewInvoice(record)}
          >
            Voir
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadInvoice(record)}
          >
            Télécharger
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Mes Factures">
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total des factures"
              value={statistics.total}
              precision={0}
              suffix="FCFA"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Montant payé"
              value={statistics.paid}
              precision={0}
              suffix="FCFA"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Montant en attente"
              value={statistics.pending}
              precision={0}
              suffix="FCFA"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Select
            style={{ width: '100%' }}
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Option value="all">Tous les statuts</Option>
            <Option value="paid">Payées</Option>
            <Option value="pending">En attente</Option>
            <Option value="unpaid">Non payées</Option>
          </Select>
        </Col>
        <Col span={12}>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
          />
        </Col>
      </Row>

      <Table
        dataSource={invoices}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          total: invoices.length,
          pageSize: 10,
          showTotal: (total) => `Total ${total} factures`,
        }}
      />
    </Card>
  );
};

export default ConsumerInvoices;