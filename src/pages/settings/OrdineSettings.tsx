import './SettingsPanels.sass';
import {Dispatch, forwardRef, ReactNode, SetStateAction, useEffect, useState} from "react";
import {Breadcrumb, BreadcrumbProps, InputNumber, message, Select, SelectProps, Slider, Space} from "antd";
import {useDifficultyContext} from "@/services/context";
import {Button, PressEvent, Spacer} from "@nextui-org/react";
import {Operator} from "@/types/ExpressionTree";
import {Box, Flex, MultiSelect, SelectItemProps} from '@mantine/core';
import {AiOutlineMinus, AiOutlinePlus, AiOutlineSetting, RiDivideFill, TiTimes} from "react-icons/all";
import {ExpressionDifficulty, Order, OrderDifficulty} from "@/services/DifficultyManager";

export const OrdineSettings = () => {
    const context = useDifficultyContext();
    const orderDifficulty = context.value.ordine;
    const [lowLimit, setLowLimit] = useState<number | null>(0);
    const [highLimit, setHighLimit] = useState<number | null>(0);
    const [saveColor, setSaveColor] =
        useState<"primary" | "secondary" | "error" | "success">('primary');
    const [allowedOrders, setAllowedOrders] =
        useState<Order[] | null>([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [length, setLength] = useState<number | null>(0);
    const [changes, setChanges] = useState<boolean>(false);

    const orderOptions = [{
        label: 'Crescătoare',
        value: Order.ascending
    }, {
        label: 'Descrescătoare',
        value: Order.descending
    }];

    const messageSuccess = () => messageApi.success('Setările au fost salvate', 1);
    const messageLoading = () => messageApi.loading('Verificare', .5);

    message.config({
        top: 200,
        maxCount: 1,
        prefixCls: 'notification',
        duration: 500
    });

    useEffect(() => {
        setLowLimit(orderDifficulty.lowLimit);
        setHighLimit(orderDifficulty.maxLimit);
        setAllowedOrders(orderDifficulty.allowedOrders);
        setLength(orderDifficulty.length - 1);
        setChanges(false);
    }, []);

    const handleRangeChange = ([low_l, high_l]: [number, number]) => {
        setLowLimit(low_l);
        setHighLimit(high_l);
    }

    const handleOrderChange = (value: any) => {
        setAllowedOrders(value);
        console.log(value);
    }

    const handleLengthChange = (value: number) => {
        setLength(value);
        console.log(value);
    }
    const onSave = () => {
        if (allowedOrders === null || allowedOrders?.length === 0) {
            messageLoading().then(() =>
                messageApi.error("Alegeti cel puțin o ordine permisă", 1.5)
            );
            setSaveColor("error");
            setTimeout(() => setSaveColor("primary"), 500);
        } else if ((length ?? 0) >= Math.abs((highLimit ?? 0) - (lowLimit ?? 0) + 1)) {
            messageLoading().then(() =>
                messageApi.error("Intervalul numeric trebuie să conțină mai multe numere decât numărul de elemente din șir")
            );
            setSaveColor("error");
            setTimeout(() => setSaveColor("primary"), 500);
        } else {
            setSaveColor('success');
            setTimeout(() => {
                setSaveColor('primary');
            }, 500);
            messageLoading().then(() => {
                messageSuccess();
                orderDifficulty.lowLimit = lowLimit ?? 0;
                orderDifficulty.maxLimit = highLimit ?? 0;
                orderDifficulty.length = (length ?? 0) + 1;
                orderDifficulty.allowedOrders = allowedOrders ?? [];


                let dif_copy = context.value;
                dif_copy.ordine = orderDifficulty;

                context.setValue(dif_copy);
                context.value.write();

                setChanges(false);
            });
        }
    }

    const areThereChanges = (): boolean => {
        if (!lowLimit || !highLimit || !length || !allowedOrders) return false;
        return (lowLimit !== orderDifficulty.lowLimit) || (highLimit !== orderDifficulty.maxLimit) ||
            allowedOrders !== orderDifficulty.allowedOrders || (length + 1) !== orderDifficulty.length;
    }

    useEffect(() => {
        setChanges(areThereChanges())
    }, [areThereChanges, context.value]);

    // @ts-ignore
    return (
        <div className="settings-panel-content">
            <Spacer y={1}/>
            <div style={{display: 'flex'}}>
                <div style={{flex: 1}}/>
                <Button size="sm"
                        bordered
                        style={{
                            fontFamily: 'DM Sans', background: 'rgba(0,0,0,0)',
                            borderRadius: '6px', color: '#f5212d', borderColor: '#f5212d'
                        }}
                        onPress={() => {
                            let new_dif = new OrderDifficulty();

                            setLowLimit(new_dif.lowLimit);
                            setHighLimit(new_dif.maxLimit);
                            setLength(new_dif.length - 1);
                            setAllowedOrders(new_dif.allowedOrders);
                        }} color="error"
                >
                    Resetați valorile
                </Button>
                <Spacer x={1}/>
                <Button size="sm" style={{fontFamily: 'DM Sans', borderRadius: '6px'}} disabled={!changes}
                        onClick={() => onSave()} color={saveColor}
                >
                    Salvați
                </Button>
            </div>
            <div style={{flex: 1}}/>
            <div className="range">
                {contextHolder}
                <h4>Configurare interval numeric</h4>
                <div className="inputs">
                    <InputNumber value={lowLimit} onChange={(val) => setLowLimit(val)}
                                 step={1} style={{marginRight: '10px'}}/>
                    <Slider range value={[lowLimit ?? 0, highLimit ?? 0]}
                            onChange={handleRangeChange} tooltip={{open: true}}
                            min={1} max={100} step={1}
                            className="slider"
                    />
                    <InputNumber value={highLimit} onChange={(val) => setHighLimit(val)}
                                 step={1} style={{marginLeft: '10px'}}/>
                </div>
            </div>
            <Spacer y={2}/>
            <div className="orders">
                <h4>Configurare ordini permise</h4>
                <Space direction="vertical" style={{width: '100%'}}>
                    {/* @ts-ignore */}
                    <MultiSelect value={allowedOrders} data={orderOptions} placeholder="Alegeți operațiile permise"
                                 onChange={handleOrderChange} error={allowedOrders?.length === 0}
                    />
                </Space>
            </div>
            <Spacer y={2}/>
            <div className="indent">
                <h4>Configurare număr de elemente în șir</h4>
                <div style={{display: "flex", flexDirection: "row", justifyContent: 'center', alignItems: 'center'}}>
                    <span style={{marginRight: '1rem', fontFamily: 'DM Sans'}}>{length}</span>
                    <Slider value={length ?? 0} min={2} max={10} step={1}
                            onChange={handleLengthChange} style={{flex: '1'}}
                    />
                </div>
            </div>

            <div style={{flex: 1}}/>
        </div>
    );
};