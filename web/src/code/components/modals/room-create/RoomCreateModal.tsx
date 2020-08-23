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

import { CreateRoomMutationVariables, Room, RoomType, useCreateRoomMutation } from '../../../../graphql/generated-types';
import { FormikRoomNameAutocompleteField } from '../../common/form-fields/room/FormikRoomNameAutocompleteField';
import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { FormikSurfaceAreaField } from '../../common/form-fields/surface-area/FormikSurfaceAreaField';
import { FormikRoomTypeField } from '../../common/form-fields/room-type/FormikRoomTypeField';
import { useModalNavigationBlocker } from '../../../utils/hooks/useModalNavigationBlocker';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { supportedRoomTypes } from '../../../config/supportedRoomTypes';
import { AVERAGE_CEILING_HEIGHT } from '../../../config/constants';
import { ResponsiveModalProps } from '../ResponsiveModalProps';
import { roomCreateModalAtom } from './roomCreateModalAtom';


interface RoomCreateFormData extends Omit<CreateRoomMutationVariables, 'type'> {
    type: RoomType | null;
}

export function RoomCreateModal({ isMobile }: ResponsiveModalProps): React.ReactElement {
    const { t } = useTranslation();
    const [ { open, projectData }, setModalState ] = useRecoilState(roomCreateModalAtom);

    const handleModalClose = React.useCallback(() => {
        setModalState((prevState) => ({ ...prevState, open: false }));
    }, [ setModalState ]);

    const validationSchema = RoomCreateFormValidationSchema(t);
    const handleSubmit = RoomCreateFormSubmitHandler(handleModalClose);

    useModalNavigationBlocker(handleModalClose, open);
    const titleId = 'room-create-modal-title';

    return (
        <Dialog
            fullScreen={isMobile}
            open={open}
            onClose={handleModalClose}
            aria-labelledby={titleId}
            fullWidth
        >
            <DialogTitle id={titleId}>
                {t('project.createRoomModal.title')}
            </DialogTitle>

            <Formik<RoomCreateFormData>
                initialValues={{
                    projectSlug: projectData?.slug || '',
                    type: null,
                    name: '',
                    floor: undefined,
                    wall: undefined,
                    ceiling: undefined,
                    productIds: [],
                    inquiryIds: [],
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, errors, submitForm }) => (
                    <>
                        <DialogContent>
                            <Form>

                                <input type='hidden' name='projectSlug' value={values.projectSlug} />

                                <FormikRoomTypeField
                                    name='type'
                                    label={t('form.roomType.label')}
                                    aria-label={t('form.roomType.ariaLabel')}
                                    autoFocus
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

                            </Form>

                            {/*<div data-testid={'meta'}>*/}
                            {/*    <pre>{JSON.stringify(values, null, 2)}</pre>*/}
                            {/*    <pre>{JSON.stringify(errors, null, 2)}</pre>*/}
                            {/*</div>*/}
                        </DialogContent>

                        <DialogActions>
                            <Button type='button' variant='outlined' onClick={handleModalClose}>
                                {t('form.common.cancel')}
                            </Button>
                            <FormikSubmitButton type='button' onClick={submitForm}>
                                {t('form.common.create')}
                            </FormikSubmitButton>
                        </DialogActions>
                    </>
                )}
            </Formik>

        </Dialog>
    );
}


/**
 * Validation schema
 */
function RoomCreateFormValidationSchema(t: TFunction) {
    return React.useMemo(() => Yup.object<RoomCreateFormData>({

        projectSlug: Yup.string().min(3).required(),

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

        productIds: Yup.array().of(Yup.string().length(24).required()).defined(),
        inquiryIds: Yup.array().of(Yup.string().length(24).required()).defined(),

    }).defined(), [ t ]);
}


/**
 * Submit handler
 */
function RoomCreateFormSubmitHandler(onModalClose: () => void) {
    const [ createRoomMutation, { loading } ] = useCreateRoomMutation();
    usePageLinearProgressRevealer(loading);

    return React.useCallback<FormikConfig<RoomCreateFormData>['onSubmit']>(async ({ type, productIds, inquiryIds, ...rest }) => {
        console.log('SUBMIT', { type, ...rest });
        try {
            await createRoomMutation({
                variables: {
                    ...rest,
                    type: type!,
                    productIds: productIds?.length ? productIds : undefined,
                    inquiryIds: inquiryIds?.length ? inquiryIds : undefined,
                },
                update: (cache, { data }) => {
                    const createdRoom = data?.createRoom;
                    if (createdRoom) {
                        cache.modify({
                            id: cache.identify({ __typename: 'Project', slug: rest.projectSlug }),
                            fields: {
                                rooms: (existingRooms: Room[] | null) => [ ...existingRooms || [], createdRoom ],
                            },
                        });
                    }
                },
            });
            onModalClose();
        } catch (error) {
            ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();
        }
    }, [ onModalClose, createRoomMutation ]);
}
