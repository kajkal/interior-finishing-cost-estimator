import React from 'react';
import clsx from 'clsx';
import { useSetRecoilState } from 'recoil/dist';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import CategoryIcon from '@material-ui/icons/Category';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Divider from '@material-ui/core/Divider';

import { mapProductToProductUpdateFormData, productUpdateModalAtom } from '../../../../modals/product-update/productUpdateModalAtom';
import { InquiryDataFragment, ProductDataFragment } from '../../../../../../graphql/generated-types';
import { inquiryUpdateModalAtom } from '../../../../modals/inquiry-update/inquiryUpdateModalAtom';
import { mapInquiryToInquiryUpdateFormData } from '../../../../../utils/mappers/inquiryMapper';
import { CompleteProjectData, CompleteRoom } from '../../../../../utils/mappers/projectMapper';
import { mapCompleteRoomToRoomUpdateFormData } from '../../../../../utils/mappers/roomMapper';
import { FormattedCurrencyAmount } from '../../../../common/misc/FormattedCurrencyAmount';
import { roomDeleteModalAtom } from '../../../../modals/room-delete/roomDeleteModalAtom';
import { roomUpdateModalAtom } from '../../../../modals/room-update/roomUpdateModalAtom';
import { roomCreateModalAtom } from '../../../../modals/room-create/roomCreateModalAtom';
import { ConsciousRoomTypeIcon } from '../../../../common/icons/ConsciousRoomTypeIcon';
import { inquiryModalAtom } from '../../../../modals/inquiry/inquiryModalAtom';
import { productModalAtom } from '../../../../modals/product/productModalAtom';
import { FormattedProductAmount } from './FormattedProductAmount';
import { categoryConfigMap } from '../../../../../config/supportedCategories';
import { PaperButton } from '../../../../common/misc/PaperButton';
import { Section } from '../../../../common/section/Section';
import { TagChip } from '../../../../common/misc/TagChip';


export interface RoomSectionProps {
    project: Pick<CompleteProjectData, 'slug' | 'name' | 'rooms'>;
}

export function RoomSection({ project }: RoomSectionProps): React.ReactElement {
    const { t } = useTranslation();
    const classes = useStyles();
    const setRoomCreateModalState = useSetRecoilState(roomCreateModalAtom);
    const setRoomUpdateModalState = useSetRecoilState(roomUpdateModalAtom);
    const setRoomDeleteModalState = useSetRecoilState(roomDeleteModalAtom);
    const setProductUpdateModalState = useSetRecoilState(productUpdateModalAtom);
    const setInquiryUpdateModalState = useSetRecoilState(inquiryUpdateModalAtom);
    const setProductModalState = useSetRecoilState(productModalAtom);
    const setInquiryModalState = useSetRecoilState(inquiryModalAtom);

    const handleAddRoom = () => {
        setRoomCreateModalState({
            open: true,
            projectData: {
                slug: project.slug,
            },
        });
    };

    const handleEditRoom = (room: CompleteRoom) => {
        setRoomUpdateModalState({
            open: true,
            formInitialValues: mapCompleteRoomToRoomUpdateFormData(room, project.slug, t),
        });
    };

    const handleDeleteRoom = (room: CompleteRoom) => {
        setRoomDeleteModalState({
            open: true,
            roomData: room,
            projectData: project,
        });
    };

    const handleProductEdit = (product: ProductDataFragment) => {
        setProductUpdateModalState({
            open: true,
            productData: mapProductToProductUpdateFormData(product),
        });
    };

    const handleInquiryEdit = (inquiry: InquiryDataFragment) => {
        setInquiryUpdateModalState({
            open: true,
            inquiryData: mapInquiryToInquiryUpdateFormData(inquiry),
        });
    };

    const handleOpenProduct = (product: ProductDataFragment) => {
        setProductModalState({
            open: true,
            productData: product,
        });
    };

    const handleOpenInquiry = (inquiry: InquiryDataFragment) => {
        setInquiryModalState({
            open: true,
            inquiryData: inquiry,
        });
    };

    return (
        <Section id='rooms' title={t('project.rooms')} defaultExpanded className={classes.roomList}>
            {project.rooms?.map((room) => (
                <Paper key={room.id} variant='outlined' data-testid='room'>

                    <div className={classes.roomHeader}>
                        <ConsciousRoomTypeIcon
                            roomType={room.type}
                            className={classes.roomTypeIcon}
                            aria-hidden
                        />
                        <Typography className={classes.roomName}>
                            {room.name}
                        </Typography>
                    </div>

                    {[ room.floor, room.wall, room.ceiling ].some(isNumber) && (
                        <div className={classes.roomSection}>
                            <Divider className={classes.dividerSectionTop} />
                            <div className={classes.roomDimensions}>
                                {isNumber(room.floor) && (
                                    <RoomSurfaceArea label={t('project.floorArea')} surfaceArea={room.floor} />
                                )}
                                {isNumber(room.wall) && (
                                    <RoomSurfaceArea label={t('project.wallsArea')} surfaceArea={room.wall} />
                                )}
                                {isNumber(room.ceiling) && (
                                    <RoomSurfaceArea label={t('project.ceilingArea')} surfaceArea={room.ceiling} />
                                )}
                            </div>
                        </div>
                    )}

                    <div className={classes.roomSection}>
                        <Divider className={classes.dividerSectionTop} />
                        <Typography variant='body2' gutterBottom color='textSecondary'>
                            {t('product.products')}
                        </Typography>

                        <div className={clsx(classes.roomSectionContent, classes.productList)} data-testid='product-list'>
                            {(room.products?.length)
                                ? (room.products.map(({ product, amount }) => (
                                    <React.Fragment key={product.id}>
                                        <div>
                                            <Typography>
                                                {product.name}
                                            </Typography>
                                            <div>
                                                <TagChip
                                                    clickable
                                                    className={classes.chipButton}
                                                    onClick={() => handleOpenProduct(product)}
                                                    label={t('form.common.open')}
                                                    aria-label={t('form.common.open')}
                                                    icon={<OpenInNewIcon />}
                                                />
                                                <TagChip
                                                    clickable
                                                    className={classes.chipButton}
                                                    onClick={() => handleProductEdit(product)}
                                                    label={t('form.common.update')}
                                                    aria-label={t('product.updateModal.title')}
                                                    icon={<EditIcon />}
                                                />
                                                {product.tags?.map((tag) => (
                                                    <TagChip key={tag} label={tag} />
                                                ))}
                                            </div>
                                        </div>

                                        <Typography component='span' className={classes.itemQuantity1}>
                                            {amount.toString().split('.')[ 0 ]}
                                        </Typography>
                                        <Typography component='span' className={classes.itemQuantity2}>
                                            {amount.toString().split('.')[ 1 ] && `.${amount.toString().split('.')[ 1 ]}`}
                                        </Typography>

                                        <FormattedProductAmount
                                            quantity={amount}
                                            currencyAmount={product.price || undefined}
                                            className={classes.itemPrice}
                                        />
                                    </React.Fragment>
                                )))
                                : (
                                    <Typography variant='body2'>
                                        {t('project.noRoomProducts')}
                                    </Typography>
                                )}
                        </div>
                    </div>

                    <div className={classes.roomSection}>
                        <Divider className={classes.dividerSectionTop} />
                        <Typography variant='body2' gutterBottom color='textSecondary'>
                            {t('inquiry.inquiries')}
                        </Typography>

                        <div className={clsx(classes.roomSectionContent, classes.inquiryList)} data-testid='inquiry-list'>
                            {(room.inquiries?.length)
                                ? (room.inquiries.map((inquiry) => {
                                    const minQuote = [ ...inquiry.quotes || [] ]
                                        .sort((a, b) => a.price.amount - b.price.amount)
                                        .find(Boolean);
                                    return (
                                        <React.Fragment key={inquiry.id}>
                                            <div>
                                                <Typography>
                                                    {inquiry.title}
                                                </Typography>
                                                <div>
                                                    <TagChip
                                                        clickable
                                                        className={classes.chipButton}
                                                        onClick={() => handleOpenInquiry(inquiry)}
                                                        label={t('form.common.open')}
                                                        aria-label={t('form.common.open')}
                                                        icon={<OpenInNewIcon />}
                                                    />
                                                    <TagChip
                                                        clickable
                                                        className={classes.chipButton}
                                                        onClick={() => handleInquiryEdit(inquiry)}
                                                        label={t('form.common.update')}
                                                        aria-label={t('inquiry.updateModal.title')}
                                                        icon={<EditIcon />}
                                                    />
                                                    <TagChip
                                                        label={t(categoryConfigMap[ inquiry.category ].tKey)}
                                                        icon={<CategoryIcon />}
                                                    />
                                                </div>
                                            </div>

                                            {(minQuote)
                                                ? (
                                                    <FormattedCurrencyAmount
                                                        className={classes.itemPrice}
                                                        currencyAmount={minQuote.price}
                                                    />
                                                )
                                                : (
                                                    <Typography variant='body2' className={classes.itemPrice}>
                                                        {t('inquiry.noOffers')}
                                                    </Typography>
                                                )}

                                        </React.Fragment>
                                    );
                                }))
                                : (
                                    <Typography variant='body2'>
                                        {t('project.noRoomInquiries')}
                                    </Typography>
                                )}
                        </div>
                    </div>

                    <Divider className={classes.dividerActionsTop} />

                    <div className={classes.roomActions}>
                        <Button variant='outlined' size='small' onClick={() => handleDeleteRoom(room)}
                            startIcon={<DeleteIcon />}>
                            {t('form.common.delete')}
                        </Button>
                        <Button variant='outlined' size='small' onClick={() => handleEditRoom(room)}
                            startIcon={<EditIcon />}>
                            {t('form.common.update')}
                        </Button>
                    </div>
                </Paper>
            ))}

            <PaperButton onClick={handleAddRoom} contentClassName={classes.addRoomButton}>
                <Typography>
                    {t('project.addRoom')}
                </Typography>
            </PaperButton>

        </Section>
    );
}

function isNumber(value: unknown): value is number {
    return typeof value === 'number';
}

interface RoomSurfaceAreaProps {
    label: string;
    surfaceArea: number;
}

function RoomSurfaceArea({ label, surfaceArea }: RoomSurfaceAreaProps): React.ReactElement {
    return (
        <>
            <Typography variant='body2' color='textSecondary'>
                {label}
            </Typography>
            <Typography variant='body2'>
                {`${surfaceArea.toFixed(1) || '-'} `}
                <span>m<sup>2</sup></span>
            </Typography>
        </>
    );
}

const useStyles = makeStyles((theme) => ({
    dividerSectionTop: {
        margin: theme.spacing(0, -0.5, 1),
    },
    dividerActionsTop: {
        margin: theme.spacing(0, 1),
    },
    roomSection: {
        padding: theme.spacing(0, 1.5, 2),
    },
    roomSectionContent: {
        [ theme.breakpoints.up('sm') ]: {
            margin: theme.spacing(0, 1),
        },
    },
    roomHeader: {
        padding: theme.spacing(2.5, 1.5),
        display: 'flex',
        alignItems: 'center',
    },
    roomTypeIcon: {
        fontSize: '2rem',
        marginRight: theme.spacing(1.5),
    },
    roomName: {
        fontSize: '1.2rem',
    },
    roomDimensions: {
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gridGap: theme.spacing(0, 1),
        gap: theme.spacing(0, 1),
        alignItems: 'end',
    },
    roomList: {
        '& > *': {
            margin: theme.spacing(0.5, 0),
        },
    },
    productList: {
        display: 'grid',
        gridTemplateColumns: '8fr minmax(min-content, 40px) minmax(min-content, 40px) minmax(min-content, 1fr)',
        gridGap: theme.spacing(0.5, 0),
        gap: theme.spacing(0.5, 0),
        alignItems: 'start',
    },
    itemQuantity1: {
        marginLeft: theme.spacing(1),
        justifySelf: 'end',
    },
    itemQuantity2: {
        justifySelf: 'start',
        marginRight: theme.spacing(1),
    },
    itemPrice: {
        justifySelf: 'end',
    },
    inquiryList: {
        display: 'grid',
        gridTemplateColumns: '8fr minmax(min-content, 1fr)',
        gridGap: theme.spacing(0.5, 0),
        gap: theme.spacing(0.5, 0),
        alignItems: 'start',
    },
    roomActions: {
        display: 'flex',
        padding: theme.spacing(1),
        alignItems: 'center',
        justifyContent: 'flex-end',
        '& > :not(:first-child)': {
            marginLeft: theme.spacing(1),
        },
    },
    addRoomButton: {
        padding: theme.spacing(1, 3),
    },
    chipButton: {
        borderRadius: theme.shape.borderRadius,
    },
}));
