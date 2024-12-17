import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Button,
  notification,
  Spin,
  Alert,
  Typography,
  Space,
  Divider
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import api from '../../utils/axios';

const { Title, Text } = Typography;

const PricingSettingsPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Charger les paramètres actuels
  useEffect(() => {
    loadCurrentPricing();
  }, []);

  const loadCurrentPricing = async () => {
    try {
      const response = await api.get('/service-pricing/current');
      const { threshold, base_price, extra_price } = response.data.data;
      
      form.setFieldsValue({
        threshold,
        base_price,
        extra_price
      });
    } catch (error) {
      notification.error({
        message: 'Erreur',
        description: 'Impossible de récupérer la configuration actuelle.'
      });
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setSaving(true);
      await api.put('/service-pricing/update', values);
      
      notification.success({
        message: 'Succès',
        description: 'Configuration de tarification mise à jour avec succès.'
      });
    } catch (error) {
      notification.error({
        message: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors de la mise à jour.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>Paramètres de tarification</Title>
      <Text type="secondary">
        Configurez ici les paramètres de tarification de l'eau pour votre service.
      </Text>

      <Card style={{ marginTop: 24 }}>
        <Alert
          message="Information sur la tarification"
          description={
            <div>
              <p>La tarification se fait en deux tranches :</p>
              <ul>
                <li>Une tranche de base jusqu'au seuil défini</li>
                <li>Une tranche majorée au-delà du seuil</li>
              </ul>
            </div>
          }
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark="optional"
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Form.Item
              label="Seuil de consommation (m³)"
              name="threshold"
              rules={[
                { required: true, message: 'Le seuil est requis' },
                { type: 'number', min: 1, message: 'Le seuil doit être supérieur à 0' }
              ]}
              tooltip="Volume d'eau en m³ avant application du tarif majoré"
            >
              <InputNumber
                style={{ width: '100%' }}
                step="1"
                min="1"
                placeholder="Ex: 50"
              />
            </Form.Item>

            <Form.Item
              label="Prix de base (FCFA/m³)"
              name="base_price"
              rules={[
                { required: true, message: 'Le prix de base est requis' },
                { type: 'number', min: 1, message: 'Le prix doit être supérieur à 0' }
              ]}
              tooltip="Prix appliqué jusqu'au seuil de consommation"
            >
              <InputNumber
                style={{ width: '100%' }}
                step="50"
                min="1"
                placeholder="Ex: 500"
              />
            </Form.Item>

            <Form.Item
              label="Prix majoré (FCFA/m³)"
              name="extra_price"
              rules={[
                { required: true, message: 'Le prix majoré est requis' },
                { type: 'number', min: 1, message: 'Le prix doit être supérieur à 0' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || value <= getFieldValue('base_price')) {
                      return Promise.reject('Le prix majoré doit être supérieur au prix de base');
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
              tooltip="Prix appliqué au-delà du seuil de consommation"
            >
              <InputNumber
                style={{ width: '100%' }}
                step="50"
                min="1"
                placeholder="Ex: 750"
              />
            </Form.Item>
          </Space>

          <Divider />

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              size="large"
              block
            >
              Enregistrer les modifications
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default PricingSettingsPage;