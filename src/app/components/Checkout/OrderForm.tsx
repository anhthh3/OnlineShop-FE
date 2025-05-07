/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button } from '@mui/material';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import RequiredLabel from '../Common/RequiredLabel';
import { OnApproveActions } from '@paypal/paypal-js';
import { getOrders } from '@/generated/api/endpoints/orders/orders';
import { useRouter } from 'next/navigation';
import { getPaymentMethod } from '@/generated/api/endpoints/payment-method/payment-method';
import { PaymentMethodResponseDto } from '@/generated/api/models';
import toast from 'react-hot-toast';
import useCartStore from '@/stores/useCartStore';

const orderSchema = z.object({
  fullName: z.string().min(1, 'Recipient name is required'),
  address: z.string().min(1, 'Shipping address is required'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(11, 'Phone number must not exceed 11 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only numbers'),
});

type OrderFormData = z.infer<typeof orderSchema>;

const OrderFormFields = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<OrderFormData>();

  return (
    <>
      <TextField
        label={<RequiredLabel label="Recipient Name" />}
        variant="outlined"
        fullWidth
        {...register('fullName')}
        error={!!errors.fullName}
        helperText={errors.fullName?.message}
      />

      <TextField
        label={<RequiredLabel label="Shipping Address" />}
        variant="outlined"
        fullWidth
        {...register('address')}
        error={!!errors.address}
        helperText={errors.address?.message}
      />

      <TextField
        label={<RequiredLabel label="Phone Number" />}
        variant="outlined"
        fullWidth
        {...register('phoneNumber')}
        error={!!errors.phoneNumber}
        helperText={errors.phoneNumber?.message}
      />
    </>
  );
};

type EnvPaypalOptions = 'production' | 'sandbox';

const ButtonCheckout = () => {
  const router = useRouter();

  const {
    handleSubmit,
    trigger,
    formState: { isValid },
    getValues,
  } = useFormContext<OrderFormData>();
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [disableCOD, setDisableCOD] = useState(false);
  const [disablePaypal, setDisablePaypal] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [retryOrderId, setRetryOrderId] = useState<string | null>(null);
  const [retryPaypalId, setRetryPaypalId] = useState<string | null>(null);

  const [listPaymentMethod, setListPaymentMethod] = useState<
    PaymentMethodResponseDto[]
  >([]);

  const { paymentMethodControllerFindAll } = getPaymentMethod();

  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
    enableFunding: '',
    disableFunding: ['paylater', 'card'],
    buyerCountry: 'US',
    currency: 'USD',
    components: 'buttons',
    environment: 'sandbox' as EnvPaypalOptions,
    locale: 'en_GB',
  };

  const { ordersControllerCreate, ordersControllerCaptureOrder } = getOrders();
  const { getCartFromServer, clearCartItems } = useCartStore();

  const onSubmit = async (data: OrderFormData) => {
    setIsPlacingOrder(true);
    setDisablePaypal(true);
    try {
      const response = await ordersControllerCreate({
        paymentId: 1,
        receiver: data.fullName,
        receiver_phone: data.phoneNumber,
        delivery_address: data.address,
      });
      if (response.success) {
        await getCartFromServer();
        router.push('/success');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      await clearCartItems();
      router.push(`/failed?message=${encodeURIComponent(error.message)}`);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handlePaypalClick = async (): Promise<void> => {
    const isValid = await trigger();
    setPaypalEnabled(isValid);
  };

  const paypalAvailable = listPaymentMethod.some(
    (method) => method.id === 2 && method.status === 'active',
  );

  const handleCreatePaypalOrder = async () => {
    try {
      setDisableCOD(true);
      if (retryPaypalId) {
        return retryPaypalId;
      }

      const formData = getValues();

      const response = await ordersControllerCreate({
        paymentId: 2,
        receiver: formData.fullName,
        receiver_phone: formData.phoneNumber,
        delivery_address: formData.address,
      });
      const [orderPaypalId, orderId] = response.data.id.split('-');
      setRetryPaypalId(orderPaypalId);
      setRetryOrderId(orderId);

      return orderPaypalId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      await clearCartItems();
      router.push(`/failed?message=${encodeURIComponent(error.message)}`);
      return '';
    }
  };

  const handleCapturePaypalOrder = async (
    orderPaypalId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    actions: OnApproveActions,
  ) => {
    try {
      const response = await ordersControllerCaptureOrder(
        orderPaypalId,
        retryOrderId as string,
      );

      if (response.success) {
        await getCartFromServer();
        router.push('/success');
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to complete your order, please try again!');
    }
  };

  const getListPaymentMethod = async () => {
    const response = await paymentMethodControllerFindAll();
    setListPaymentMethod(response.data);
  };

  useEffect(() => {
    getListPaymentMethod();
  }, []);

  useEffect(() => {
    setPaypalEnabled(isValid);
  }, [isValid]);

  return (
    <div className="border-gray-3 mt-6 py-5 px-4 sm:px-8.5 bg-white shadow-1 rounded-[10px]">
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit(onSubmit)}
          disabled={disableCOD}
          loading={isPlacingOrder}
        >
          Cash on delivery
        </Button>

        {paypalAvailable && (
          <div className="w-full sm:w-auto">
            <PayPalScriptProvider options={initialOptions}>
              <PayPalButtons
                style={{
                  shape: 'rect',
                  layout: 'vertical',
                  color: 'blue',
                  label: 'checkout',
                }}
                forceReRender={[paypalEnabled]}
                disabled={!paypalEnabled || disablePaypal}
                onClick={handlePaypalClick}
                createOrder={handleCreatePaypalOrder}
                onApprove={({ orderID }, actions) =>
                  handleCapturePaypalOrder(orderID, actions)
                }
              />
            </PayPalScriptProvider>
          </div>
        )}
      </div>
    </div>
  );
};

const OrderForm = () => {
  const methods = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    mode: 'onChange',
  });

  return (
    <FormProvider {...methods}>
      <div className="bg-white shadow-1 mt-10 rounded-[10px]">
        <div className="py-5 px-4 sm:px-8.5">
          <h3 className="font-medium text-xl text-dark mb-4">
            Shipping Information
          </h3>
          <form className="flex flex-col gap-4" noValidate autoComplete="off">
            <OrderFormFields />
          </form>
        </div>
      </div>
      <ButtonCheckout />
    </FormProvider>
  );
};

export default OrderForm;
