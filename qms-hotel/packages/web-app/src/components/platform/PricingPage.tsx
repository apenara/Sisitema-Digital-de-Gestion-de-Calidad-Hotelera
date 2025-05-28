import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid as MuiGrid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
  Container,
  Paper,
  Divider,
} from '@mui/material';
import {
  Check as CheckIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  RocketLaunch as RocketLaunchIcon,
} from '@mui/icons-material';
import { calculatePlanPrice, SUBSCRIPTION_PLANS, getRecommendedPlan, formatPrice } from '../../../../shared/types/SubscriptionPlan';
import type { BillingCycle } from '../../../../shared/types/SubscriptionPlan';


interface PricingPageProps {
  currentPlanId?: string;
  companySize?: number;
  onSelectPlan?: (planId: string) => void;
}

const planIcons = {
  basic: <BusinessIcon />,
  professional: <TrendingUpIcon />,
  enterprise: <StarIcon />,
  startup: <RocketLaunchIcon />,
};

const planColors = {
  basic: 'primary',
  professional: 'secondary',
  enterprise: 'warning',
  startup: 'info',
} as const;

export const PricingPage: React.FC<PricingPageProps> = ({
  currentPlanId,
  companySize,
  onSelectPlan,
}) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const recommendedPlan = companySize ? getRecommendedPlan(companySize, 'hotel', 'small') : null;

  const handleBillingCycleChange = (
    _: React.MouseEvent<HTMLElement>,
    newCycle: BillingCycle | null
  ) => {
    if (newCycle !== null) {
      setBillingCycle(newCycle);
    }
  };

  const getPlanFeatures = (planId: string) => {
    const plan = SUBSCRIPTION_PLANS[planId];
    const features = [];

    if (plan.limits.maxUsers === -1) {
      features.push('Usuarios ilimitados');
    } else {
      features.push(`Hasta ${plan.limits.maxUsers} usuarios`);
    }

    if (plan.limits.maxStorageGB === -1) {
      features.push('Almacenamiento ilimitado');
    } else {
      features.push(`${plan.limits.maxStorageGB} GB de almacenamiento`);
    }

    if (plan.limits.maxCompanies === -1) {
      features.push('Empresas ilimitadas');
    } else {
      features.push(`Hasta ${plan.limits.maxCompanies} empresas`);
    }

    if (plan.limits.maxProcesses === -1) {
      features.push('Procesos ilimitados');
    } else {
      features.push(`Hasta ${plan.limits.maxProcesses} procesos`);
    }

    features.push(...Object.keys(plan.features));

    return features;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Planes y Precios
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Elige el plan perfecto para tu empresa
        </Typography>

        <ToggleButtonGroup
          value={billingCycle}
          exclusive
          onChange={handleBillingCycleChange}
          sx={{ mt: 2 }}
        >
          <ToggleButton value="monthly">
            Mensual
          </ToggleButton>
          <ToggleButton value="yearly">
            Anual (ahorra 20%)
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <div className="grid-container">
        {Object.entries(SUBSCRIPTION_PLANS).map(([planId, plan]) => {
          const price = calculatePlanPrice(plan, billingCycle);
          const isCurrentPlan = currentPlanId === planId;
          const isRecommended = recommendedPlan === planId;
          const isEnterprise = planId === 'enterprise';

          return (
            <div className="grid-item" style={{ gridColumn: 'span 3' }} key={planId}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  ...(isRecommended && {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  }),
                  ...(isCurrentPlan && {
                    backgroundColor: 'action.selected',
                  }),
                }}
                variant={isRecommended ? 'outlined' : 'elevation'}
              >
                {isRecommended && (
                  <Paper
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      px: 2,
                      py: 0.5,
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                    }}
                  >
                    <Typography variant="caption" fontWeight="bold">
                      RECOMENDADO
                    </Typography>
                  </Paper>
                )}

                <CardContent sx={{ flexGrow: 1, pt: isRecommended ? 4 : 2 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box color={`${planColors[planId as keyof typeof planColors]}.main`}>
                      {planIcons[planId as keyof typeof planIcons]}
                    </Box>
                    <Typography variant="h5" component="h2" ml={1}>
                      {plan.name}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {plan.description}
                  </Typography>

                  <Box my={3}>
                    {!isEnterprise ? (
                      <>
                        <Typography variant="h3" component="div">
                          {formatPrice(price)}
                          <Typography
                            variant="body2"
                            component="span"
                            color="text.secondary"
                          >
                            /{billingCycle === 'monthly' ? 'mes' : 'año'}
                          </Typography>
                        </Typography>
                        {billingCycle === 'yearly' && (
                          <Chip
                            label="20% descuento"
                            size="small"
                            color="success"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </>
                    ) : (
                      <Typography variant="h4" color="text.secondary">
                        Contactar
                      </Typography>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <List dense>
                    {getPlanFeatures(planId).map((feature, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckIcon fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{
                            variant: 'body2',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant={isCurrentPlan ? 'outlined' : 'contained'}
                    color={planColors[planId as keyof typeof planColors]}
                    disabled={isCurrentPlan}
                    onClick={() => onSelectPlan?.(planId)}
                  >
                    {isCurrentPlan
                      ? 'Plan Actual'
                      : isEnterprise
                      ? 'Contactar Ventas'
                      : 'Seleccionar Plan'}
                  </Button>
                </CardActions>
              </Card>
            </div>
          );
        })}
      </div>

      <Box mt={6} textAlign="center">
        <Typography variant="h6" gutterBottom>
          ¿Necesitas ayuda para elegir?
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Todos los planes incluyen soporte técnico, actualizaciones automáticas y acceso a la API.
        </Typography>
        <Button variant="outlined" size="large">
          Contactar con Ventas
        </Button>
      </Box>
    </Container>
  );
};