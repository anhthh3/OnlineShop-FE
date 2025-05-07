/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useParams } from 'next/navigation';
import Breadcrumb from '../Common/Breadcrumb';
import { useEffect, useState } from 'react';
import { getProduct } from '@/generated/api/endpoints/product/product';
import { ProductResponse } from '@/generated/api/models';
import { Box, Button, CircularProgress } from '@mui/material';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import useCartStore from '@/stores/useCartStore';

const ProductDetails = () => {
  const routeParams = useParams();
  const productId = Number(routeParams.id);

  const [productData, setProductData] = useState<ProductResponse>();
  const [error, setError] = useState<boolean>(false);

  const [previewImg, setPreviewImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [stock, setStock] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  const { user } = useAuthStore();
  const { cartItems, addItemToCart } = useCartStore();

  const fetchProduct = async () => {
    try {
      const data =
        await getProduct().productControllerGetProductById(productId);
      setProductData(data.data);
      setStock(data.data.stock);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError(true);
    }
  };

  const itemInCart = cartItems.find((item) => item.product.id === productId);
  const isAdded = !!itemInCart;

  const handleDecrease = () => {
    if (!user || isAdded) return;
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    if (!user || isAdded) return;
    if (quantity < stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('You have to sign in!', { duration: 2000 });
      return;
    }
    setIsAdding(true);

    await toast.promise(addItemToCart(Number(productData?.id), quantity), {
      loading: 'Adding to cart...',
      success: 'Added to cart!',
      error: 'Failed to add item!',
    });

    setIsAdding(false);
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  if (error) {
    return (
      <div className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <p className="text-3xl text-center text-blue-600 font-semibold">
            Product doesn&apos;t existed
          </p>
        </div>
      </div>
    );
  }

  const listImage: string[] = JSON.parse(productData?.image || '[]');

  return (
    <div>
      <Breadcrumb title={'Product Details'} />

      {productData ? (
        <>
          <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28">
            <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
              <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
                {/* Product Image Preview */}
                <div className="lg:max-w-[570px] w-full">
                  <div className="lg:min-h-[512px] rounded-lg shadow-1 bg-gray-2 p-4 sm:p-7.5 relative flex items-center justify-center">
                    <div>
                      <img
                        src={listImage[previewImg]}
                        alt="products-details"
                        width={400}
                        height={400}
                      />
                    </div>
                  </div>

                  {/* ?  &apos;border-blue &apos; :  &apos;border-transparent&apos; */}
                  <div className="flex flex-wrap sm:flex-nowrap gap-4.5 mt-6">
                    {listImage.map((imgage, key) => (
                      <button
                        onClick={() => setPreviewImg(key)}
                        key={key}
                        className={`flex items-center justify-center w-15 sm:w-25 h-15 sm:h-25 overflow-hidden rounded-lg bg-gray-2 shadow-1 ease-out duration-200 border-2 hover:border-blue ${
                          key === previewImg
                            ? 'border-blue'
                            : 'border-transparent'
                        }`}
                      >
                        <img
                          width={50}
                          height={50}
                          src={imgage}
                          alt="thumbnail"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Content */}
                <div className="max-w-[539px] w-full">
                  <div className="flex items-center justify-between mb-3 gap-x-4">
                    <h2 className="font-semibold text-xl sm:text-2xl xl:text-custom-3 text-dark">
                      {productData?.name || ''}
                    </h2>

                    <div className="inline-flex font-medium text-custom-sm text-white bg-blue rounded py-0.5 px-2.5">
                      {productData?.discount}% OFF
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-5.5 mb-4.5">
                    <div className="flex items-center gap-2.5">
                      {/* <!-- stars --> */}
                      <div className="flex items-center gap-1">
                        {Array.from({
                          length: Number(productData?.rating),
                        }).map((_, idx) => (
                          <svg
                            key={idx}
                            className="fill-[#FFA645]"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g clipPath="url(#clip0_375_9172)">
                              <path
                                d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z"
                                fill=""
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_375_9172">
                                <rect width="18" height="18" fill="white" />
                              </clipPath>
                            </defs>
                          </svg>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {productData.stock > 0 ? (
                        <>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g clipPath="url(#clip0_375_9221)">
                              <path
                                d="M10 0.5625C4.78125 0.5625 0.5625 4.78125 0.5625 10C0.5625 15.2188 4.78125 19.4688 10 19.4688C15.2188 19.4688 19.4688 15.2188 19.4688 10C19.4688 4.78125 15.2188 0.5625 10 0.5625ZM10 18.0625C5.5625 18.0625 1.96875 14.4375 1.96875 10C1.96875 5.5625 5.5625 1.96875 10 1.96875C14.4375 1.96875 18.0625 5.59375 18.0625 10.0312C18.0625 14.4375 14.4375 18.0625 10 18.0625Z"
                                fill="#22AD5C"
                              />
                              <path
                                d="M12.6875 7.09374L8.9688 10.7187L7.2813 9.06249C7.00005 8.78124 6.56255 8.81249 6.2813 9.06249C6.00005 9.34374 6.0313 9.78124 6.2813 10.0625L8.2813 12C8.4688 12.1875 8.7188 12.2812 8.9688 12.2812C9.2188 12.2812 9.4688 12.1875 9.6563 12L13.6875 8.12499C13.9688 7.84374 13.9688 7.40624 13.6875 7.12499C13.4063 6.84374 12.9688 6.84374 12.6875 7.09374Z"
                                fill="#22AD5C"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_375_9221">
                                <rect width="20" height="20" fill="white" />
                              </clipPath>
                            </defs>
                          </svg>

                          <span className="text-green"> In Stock </span>
                        </>
                      ) : (
                        <span className="text-red">Out of Stock</span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-medium text-custom-1 mb-4.5">
                    <span className="text-dark mr-2">
                      Price: ${productData?.priceAfterDis.toLocaleString()}
                    </span>
                    <span className="line-through text-dark-3">
                      {' '}
                      ${productData?.price.toLocaleString()}{' '}
                    </span>
                  </h3>

                  {productData.stock > 0 && (
                    <form onSubmit={(e) => e.preventDefault()}>
                      <div className="flex flex-wrap items-center gap-4.5 border-t border-gray-3 mt-7.5 mb-9 py-9">
                        <div className="flex items-center rounded-md border border-gray-3">
                          <button
                            aria-label="button for remove product"
                            className="flex items-center justify-center w-12 h-12 ease-out duration-200 hover:text-blue"
                            onClick={handleDecrease}
                          >
                            <svg
                              className="fill-current"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3.33301 10.0001C3.33301 9.53984 3.7061 9.16675 4.16634 9.16675H15.833C16.2932 9.16675 16.6663 9.53984 16.6663 10.0001C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10.0001Z"
                                fill=""
                              />
                            </svg>
                          </button>

                          <span className="flex items-center justify-center w-16 h-12 border-x border-gray-4">
                            {quantity}
                          </span>

                          <button
                            onClick={handleIncrease}
                            aria-label="button for add product"
                            className="flex items-center justify-center w-12 h-12 ease-out duration-200 hover:text-blue"
                          >
                            <svg
                              className="fill-current"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3.33301 10C3.33301 9.5398 3.7061 9.16671 4.16634 9.16671H15.833C16.2932 9.16671 16.6663 9.5398 16.6663 10C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10Z"
                                fill=""
                              />
                              <path
                                d="M9.99967 16.6667C9.53944 16.6667 9.16634 16.2936 9.16634 15.8334L9.16634 4.16671C9.16634 3.70647 9.53944 3.33337 9.99967 3.33337C10.4599 3.33337 10.833 3.70647 10.833 4.16671L10.833 15.8334C10.833 16.2936 10.4599 16.6667 9.99967 16.6667Z"
                                fill=""
                              />
                            </svg>
                          </button>
                        </div>

                        <Button
                          variant="contained"
                          disabled={isAdded}
                          loading={isAdding}
                          onClick={
                            !isAdded && !isAdding ? handleAddToCart : undefined
                          }
                          className={`!inline-flex !font-medium !text-white !py-3 !px-7 !rounded-md transition-all ${
                            isAdded
                              ? '!bg-dark-2 !cursor-not-allowed'
                              : '!bg-dark hover:!bg-dark-2'
                          }`}
                        >
                          {isAdded ? 'Added' : 'Add to Cart'}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden bg-gray-2 py-20">
            <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
              {/* <!--== tab header start ==--> */}
              <div className="flex flex-wrap items-center bg-white rounded-[10px] shadow-1 gap-5 xl:gap-12.5 py-4.5 px-4 sm:px-6">
                <button
                  className={`font-medium lg:text-lg ease-out duration-200 hover:text-blue relative before:h-0.5 before:bg-blue before:absolute before:left-0 before:bottom-0 before:ease-out before:duration-200 hover:before:w-full text-blue before:w-full`}
                >
                  Description
                </button>
              </div>
              {/* <!--== tab header end ==--> */}

              <div>
                <div
                  className={`flex-col sm:flex-row gap-7.5 xl:gap-12.5 mt-12.5`}
                >
                  <div className="max-w-[670px] w-full">
                    <h2 className="font-medium text-2xl text-dark mb-7">
                      Specifications:
                    </h2>

                    <p className="mb-6">{productData.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="py-20">
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
