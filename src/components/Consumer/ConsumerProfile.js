// components/ConsumerProfile.js
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Card, Descriptions, Avatar, Spin, Row, Col } from 'antd';
import { axiosPublic, axiosPrivate } from '../../utils/axios';
const api = axiosPrivate;


const ConsumerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      setProfile(response.data.data);
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin size="large" />;
  if (!profile) return <div>Profil non trouvé</div>;

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Mon Profil" bordered={false}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Avatar 
                size={200} 
                src={profile.profile_image}
                style={{ marginBottom: 16 }}
              />
            </div>
          </Col>
          <Col xs={24} md={16}>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Nom d'utilisateur">
                {profile.name}
              </Descriptions.Item>
              <Descriptions.Item label="Prénom">
                {profile.first_name}
              </Descriptions.Item>
              <Descriptions.Item label="Nom">
                {profile.last_name}
              </Descriptions.Item>
              <Descriptions.Item label="Date de naissance">
                {profile.date_of_birth ? moment(profile.date_of_birth).format('DD/MM/YYYY') : 'Non renseigné'}
              </Descriptions.Item>
              <Descriptions.Item label="Téléphone">
                {profile.phone_number || 'Non renseigné'}
              </Descriptions.Item>
              <Descriptions.Item label="Adresse">
                {profile.address || 'Non renseigné'}
              </Descriptions.Item>
              <Descriptions.Item label="Service">
                {profile.service?.name || 'Non rattaché'}
              </Descriptions.Item>
              <Descriptions.Item label="Statut">
                {profile.is_active ? 'Actif' : 'Inactif'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ConsumerProfile;