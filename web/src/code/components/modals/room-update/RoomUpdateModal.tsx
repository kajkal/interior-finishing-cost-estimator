import React from 'react';
import * as Yup from 'yup';
import { TFunction } from 'i18next';
import { useRecoilState } from 'recoil/dist';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikConfig } from 'formik';

import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';

import { ProductDataFragment, Room, useUpdateRoomMutation } from '../../../../graphql/generated-types';
import { FormikRoomNameAutocompleteField } from '../../common/form-fields/room/FormikRoomNameAutocompleteField';
import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { FormikSurfaceAreaField } from '../../common/form-fields/room/FormikSurfaceAreaField';
import { useCurrentUserDataSelectors } from '../../../utils/hooks/useCurrentUserDataSelectors';
import { FormikRoomTypeField } from '../../common/form-fields/room-type/FormikRoomTypeField';
import { FormikProductSelector } from '../../common/form-fields/room/FormikProductSelector';
import { FormikInquirySelector } from '../../common/form-fields/room/FormikInquirySelector';
import { useModalNavigationBlocker } from '../../../utils/hooks/useModalNavigationBlocker';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { ProductAmountOption } from '../../common/form-fields/room/ProductSelector';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { RoomUpdateFormData, roomUpdateModalAtom } from './roomUpdateModalAtom';
import { InquiryOption } from '../../common/form-fields/room/InquirySelector';
import { supportedRoomTypes } from '../../../config/supportedRoomTypes';
import { AVERAGE_CEILING_HEIGHT } from '../../../config/constants';
import { ResponsiveModalProps } from '../ResponsiveModalProps';


export function RoomUpdateModal({ isMobile }: ResponsiveModalProps): React.ReactElement {
    const { t } = useTranslation();
    const [ { productAmounts, inquiries } ] = useCurrentUserDataSelectors();
    const [ { open, formInitialValues }, setModalState ] = useRecoilState(roomUpdateModalAtom);

    const handleModalClose = React.useCallback(() => {
        setModalState((prevState) => ({ ...prevState, open: false }));
    }, [ setModalState ]);

    const validationSchema = RoomUpdateFormValidationSchema(t);
    const handleSubmit = RoomUpdateFormSubmitHandler(handleModalClose);

    useModalNavigationBlocker(handleModalClose, open);
    const titleId = 'room-update-modal-title';

    return (
        <Dialog
            fullScreen={isMobile}
            open={open}
            onClose={handleModalClose}
            aria-labelledby={titleId}
            fullWidth
        >
            <DialogTitle id={titleId}>
                {t('project.updateRoomModal.title')}
            </DialogTitle>

            <Formik<RoomUpdateFormData>
                initialValues={formInitialValues || {
                    projectSlug: '',
                    roomId: '',
                    type: null,
                    name: '',
                    floor: undefined,
                    wall: undefined,
                    ceiling: undefined,
                    products: [],
                    inquiries: [],
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, initialValues, submitForm, resetForm }) => {
                    const inInitialState = areValuesEqInitialValues(values, initialValues);
                    return (
                        <>
                            <DialogContent>
                                <Form>

                                    <input type='hidden' name='projectSlug' value={values.projectSlug} />
                                    <input type='hidden' name='roomId' value={values.roomId} />

                                    <FormikRoomTypeField
                                        name='type'
                                        label={t('form.roomType.label')}
                                        aria-label={t('form.roomType.ariaLabel')}
                                    />

                                    <FormikRoomNameAutocompleteField
                                        name='name'
                                        label={t('form.roomName.label')}
                                        aria-label={t('form.roomName.ariaLabel')}
                                        roomType={values.type}
                                        fullWidth
                                    />

                                    <FormikSurfaceAreaField
                                        name='floor'
                                        label={t('form.roomFloorArea.label')}
                                        aria-label={t('form.roomFloorArea.ariaLabel')}
                                        optional
                                    />

                                    <FormikSurfaceAreaField
                                        name='wall'
                                        // estimate walls surface area for square room with average celling height height:
                                        suggestedValue={Math.sqrt(values.floor || 0) * 4 * AVERAGE_CEILING_HEIGHT}
                                        label={t('form.roomWallsArea.label')}
                                        aria-label={t('form.roomWallsArea.ariaLabel')}
                                        optional
                                    />

                                    <FormikSurfaceAreaField
                                        name='ceiling'
                                        // estimate ceiling surface area
                                        suggestedValue={values.floor}
                                        label={t('form.roomCeilingArea.label')}
                                        aria-label={t('form.roomCeilingArea.ariaLabel')}
                                        optional
                                    />

                                    <FormikProductSelector
                                        name='products'
                                        label={t('form.roomProductSelector.label')}
                                        productOptions={productAmounts()}
                                    />

                                    <FormikInquirySelector
                                        name='inquiries'
                                        label={t('form.roomInquirySelector.label')}
                                        inquiryOptions={inquiries()}
                                    />

                                </Form>
                            </DialogContent>

                            <DialogActions>
                                <Button type='button' variant='outlined' onClick={handleModalClose}>
                                    {t('form.common.cancel')}
                                </Button>
                                <Button type='button' variant='outlined' onClick={resetForm as () => void}
                                    disabled={inInitialState}>
                                    {t('form.common.reset')}
                                </Button>
                                <FormikSubmitButton type='button' onClick={submitForm}>
                                    {t('form.common.update')}
                                </FormikSubmitButton>
                            </DialogActions>
                        </>
                    );
                }}
            </Formik>

        </Dialog>
    );
}

function areValuesEqInitialValues(values: RoomUpdateFormData, initialValues: RoomUpdateFormData): boolean {
    return (values.projectSlug === initialValues.projectSlug)
        && (values.roomId === initialValues.roomId)
        && (values.type === initialValues.type)
        && (values.name === initialValues.name)
        && (values.floor === initialValues.floor)
        && (values.wall === initialValues.wall)
        && (values.ceiling === initialValues.ceiling)
        && (values.products.length === initialValues.products.length)
        && (values.products.every((pa) => initialValues.products.includes(pa)))
        && (values.inquiries.length === initialValues.inquiries.length)
        && (values.inquiries.every((i) => initialValues.inquiries.includes(i)));
}


/**
 * Validation schema
 */
function RoomUpdateFormValidationSchema(t: TFunction) {
    return React.useMemo(() => Yup.object<RoomUpdateFormData>({

        projectSlug: Yup.string().min(3).required(),

        roomId: Yup.string().min(1).required(),

        type: Yup.mixed().oneOf([ ...supportedRoomTypes, null ])
            .nullable()
            .required(t('form.roomType.validation.required')),

        name: Yup.string()
            .required(t('form.roomName.validation.required'))
            .min(3, t('form.roomName.validation.tooShort'))
            .max(255, t('form.roomName.validation.tooLong')),

        floor: Yup.number().max(1e5, t('form.roomFloorArea.validation.tooHigh')),
        wall: Yup.number().max(1e5, t('form.roomWallsArea.validation.tooHigh')),
        ceiling: Yup.number().max(1e5, t('form.roomCeilingArea.validation.tooHigh')),

        products: Yup.array().of(
            Yup.object<ProductAmountOption>({
                product: Yup.object<ProductDataFragment>().required(),
                amount: Yup.number()
                    .max(1e6, t('form.roomProductSelector.productAmount.validation.tooHigh'))
                    .required(t('form.roomProductSelector.productAmount.validation.required')),
            }).required(),
        ).defined(),

        inquiries: Yup.array().of(
            Yup.object<InquiryOption>().required(),
        ).defined(),

    }).defined(), [ t ]);
}


/**
 * Submit handler
 */
function RoomUpdateFormSubmitHandler(onModalClose: () => void) {
    const [ updateRoomMutation, { loading } ] = useUpdateRoomMutation();
    usePageLinearProgressRevealer(loading);

    return React.useCallback<FormikConfig<RoomUpdateFormData>['onSubmit']>(async ({ type, products, inquiries, ...rest }) => {
        const mappedProducts = products.map((option) => ({ productId: option.product.id, amount: option.amount! }));
        const mappedInquiries = inquiries.map((option) => ({ inquiryId: option.id }));
        try {
            await updateRoomMutation({
                variables: {
                    ...rest,
                    type: type!,
                    products: mappedProducts.length ? mappedProducts : undefined,
                    inquiries: mappedInquiries?.length ? mappedInquiries : undefined,
                },
                update: (cache, { data }) => {
                    const updatedRoom = data?.updateRoom;
                    if (updatedRoom) {
                        cache.modify({
                            id: cache.identify({ __typename: 'Project', slug: rest.projectSlug }),
                            fields: {
                                rooms: (existingRooms: Room[] | null) => existingRooms?.map((room) => (
                                        (room.id === rest.roomId) ? updatedRoom : room
                                    )
                                ),
                            },
                        });
                    }
                },
            });
            onModalClose();
        } catch (error) {
            ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();
        }
    }, [ onModalClose, updateRoomMutation ]);
}
