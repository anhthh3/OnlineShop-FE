'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Autocomplete,
  Avatar,
  Box,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';

import { useRouter } from 'next/navigation';
import { getProduct } from '@/generated/api/endpoints/product/product';
import { ProductResponse } from '@/generated/api/models';
import HeaderTopRight from './HeaderTopRight';

export default function Header() {
  const { productControllerSearchProductByName } = getProduct();
  const [options, setOption] = useState<ProductResponse[]>([]);
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const selectedProduct = null;
  const router = useRouter();

  const getAllProductByText = async () => {
    const data = await productControllerSearchProductByName({ text });
    if (Array.isArray(data.data)) {
      setOption(
        data.data.filter(
          (item) => item && typeof item === 'object' && 'id' in item,
        ),
      );
    } else {
      setOption([]);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && text != '') {
      (event.target as HTMLElement).blur();
      setOpen(false);
      router.push(`/product-search?text=${text}`);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (text) {
        getAllProductByText();
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [text]);

  return (
    <header className="sticky left-0 top-0 w-full z-[999] bg-white shadow">
      <div className="max-w-[1170px] mx-auto px-4 xl:px-0">
        <div className="flex gap-5 items-end lg:items-center justify-between py-4">
          {/* <!-- header top left --> */}
          <div className="flex items-center gap-50 sm:gap-50">
            <Link href="/" className="flex items-center">
              <img
                src="./images/logo2.png"
                alt=""
                className="w-22 mt-[7px] mr-1"
              />
              <span className="text-blue text-4xl font-bold">Shop</span>
            </Link>
            <div className="w-[475px]">
              <div className="relative w-full">
                <Autocomplete
                  open={open}
                  onOpen={() => setOpen(true)}
                  onClose={() => setOpen(false)}
                  disablePortal
                  disableClearable
                  value={selectedProduct!}
                  inputValue={text}
                  getOptionLabel={(option) => option?.name || ''}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  onChange={(event, value) => {
                    if (value && value.id) {
                      router.push(`/product-details/${value.id}`);
                      setText('');
                      setOpen(false);
                    }
                  }}
                  options={options}
                  popupIcon={null}
                  onInputChange={(event, newInputValue) => {
                    setText(newInputValue);
                    setOpen(!!newInputValue);
                    if (!newInputValue) setOption([]);
                  }}
                  sx={{ width: 400 }}
                  renderOption={(props, option) => {
                    const { key, ...rest } = props;
                    return (
                      <Box
                        {...rest}
                        component="li"
                        key={key}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          px: 2,
                          py: 1,
                        }}
                      >
                        <div
                          key={option.id}
                          className="flex items-center gap-1 px-2 py-1 "
                        >
                          <Avatar
                            src={(() => {
                              try {
                                const images = JSON.parse(option.image);
                                return Array.isArray(images) ? images[0] : '';
                              } catch {
                                return '';
                              }
                            })()}
                            alt={option.name}
                            sx={{ width: 40, height: 40 }}
                            variant="rounded"
                          />
                          <Box>
                            <Typography fontWeight="bold">
                              {option.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.priceAfterDis}$
                            </Typography>
                          </Box>
                        </div>
                      </Box>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search product"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {params.InputProps.endAdornment}
                            <InputAdornment position="end">
                              <button
                                type="button"
                                id="search-btn"
                                className="flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 ease-in duration-200 hover:text-blue"
                              >
                                <svg
                                  className="fill-current"
                                  width="18"
                                  height="18"
                                  viewBox="0 0 18 18"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M17.2687 15.6656L12.6281 11.8969C14.5406 9.28123 14.3437 5.5406 11.9531 3.1781C10.6875 1.91248 8.99995 1.20935 7.19995 1.20935C5.39995 1.20935 3.71245 1.91248 2.44683 3.1781C-0.168799 5.79373 -0.168799 10.0687 2.44683 12.6844C3.71245 13.95 5.39995 14.6531 7.19995 14.6531C8.91558 14.6531 10.5187 14.0062 11.7843 12.8531L16.4812 16.65C16.5937 16.7344 16.7343 16.7906 16.875 16.7906C17.0718 16.7906 17.2406 16.7062 17.3531 16.5656C17.5781 16.2844 17.55 15.8906 17.2687 15.6656ZM7.19995 13.3875C5.73745 13.3875 4.38745 12.825 3.34683 11.7844C1.20933 9.64685 1.20933 6.18748 3.34683 4.0781C4.38745 3.03748 5.73745 2.47498 7.19995 2.47498C8.66245 2.47498 10.0125 3.03748 11.0531 4.0781C13.1906 6.2156 13.1906 9.67498 11.0531 11.7844C10.0406 12.825 8.66245 13.3875 7.19995 13.3875Z"
                                    fill=""
                                  />
                                </svg>
                              </button>
                            </InputAdornment>
                          </>
                        ),
                      }}
                      onKeyDown={handleKeyDown}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* <!-- header top right --> */}
          <HeaderTopRight />
        </div>
      </div>
    </header>
  );
}
