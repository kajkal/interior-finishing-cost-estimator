import React from 'react';
import * as Yup from 'yup';
import { useRecoilState } from 'recoil/dist';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikConfig } from 'formik';

import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { Room, useDeleteRoomMutation } from '../../../../graphql/generated-types';
import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { useModalNavigationBlocker } from '../../../utils/hooks/useModalNavigationBlocker';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { FormikSubmitButton } from '../../common/form-fields/FormikSubmitButton';
import { RoomDeleteFormData, roomDeleteModalAtom } from './roomDeleteModalAtom';


export function RoomDeleteModal(): React.ReactElement {
    const { t } = useTranslation();
    const [ { open, projectData, roomData }, setModalState ] = useRecoilState(roomDeleteModalAtom);

    const handleModalClose = React.useCallback(() => {
        setModalState((prevState) => ({ ...prevState, open: false }));
    }, [ setModalState ]);

    const validationSchema = useRoomDeleteFormValidationSchema();
    const handleSubmit = useRoomDeleteFormSubmitHandler(handleModalClose);

    useModalNavigationBlocker(handleModalClose, open);
    const titleId = 'delete-room-modal-title';
    const contentId = 'delete-room-modal-content';

    return (
        <Dialog open={open} onClose={handleModalClose} aria-labelledby={titleId} aria-describedby={contentId}>

            <DialogTitle id={titleId}>
                {t('project.deleteRoomModal.title', { roomName: roomData?.name })}
            </DialogTitle>

            <Formik<RoomDeleteFormData>
                initialValues={{
                    projectSlug: projectData?.slug || '',
                    roomId: roomData?.id || '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, submitForm }) => (
                    <>
                        <DialogContent id={contentId}>

                            <Typography color='textSecondary'>
                                {t('project.deleteRoomModal.firstLine')}
                            </Typography>

                            <Form>
                                <input type='hidden' name='projectSlug' value={values.projectSlug} />
                                <input type='hidden' name='roomId' value={values.roomId} />
                            </Form>

                        </DialogContent>

                        <DialogActions>
                            <Button type='button' variant='outlined' onClick={handleModalClose} autoFocus>
                                {t('form.common.cancel')}
                            </Button>
                            <FormikSubmitButton type='button' onClick={submitForm} danger>
                                {t('form.common.delete')}
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
function useRoomDeleteFormValidationSchema() {
    return React.useMemo(() => Yup.object<RoomDeleteFormData>({
        projectSlug: Yup.string().min(3).required(),
        roomId: Yup.string().min(1).required(),
    }).defined(), []);
}


/**
 * Submit handler
 */
function useRoomDeleteFormSubmitHandler(onModalClose: () => void) {
    const [ deleteRoomMutation, { loading } ] = useDeleteRoomMutation();
    usePageLinearProgressRevealer(loading);

    return React.useCallback<FormikConfig<RoomDeleteFormData>['onSubmit']>(async (values) => {
        try {
            await deleteRoomMutation({
                variables: values,
                update: (cache, { data }) => {
                    const isSuccess = data?.deleteRoom;
                    if (isSuccess) {
                        cache.modify({
                            id: cache.identify({ __typename: 'Project', slug: values.projectSlug }),
                            fields: {
                                rooms: (existingRooms: Room[] | null) => existingRooms?.filter(({ id }) => id !== values.roomId),
                            },
                        });
                    }
                },
            });
            onModalClose();
        } catch (error) {
            ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();
        }
    }, [ onModalClose, deleteRoomMutation ]);
}
