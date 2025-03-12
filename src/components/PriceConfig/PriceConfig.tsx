import { useEffect, useState } from "react";
import { Notification } from "../../hooks/Notification";
import { IHall } from "../../models";
import "./PriceConfig.scss";

type PriceConfigProps = {
  hallData: IHall;
  onSave: (updatedHallData: IHall) => void;
  onCancel: () => void;
};

export const PriceConfig: React.FC<PriceConfigProps> = ({
  hallData,
  onSave,
  onCancel,
}) => {
  const [standardPrice, setStandardPrice] = useState(hallData.hall_price_standart);
  const [vipPrice, setVipPrice] = useState(hallData.hall_price_vip);
  const [hasChanges, setHasChanges] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    setStandardPrice(hallData.hall_price_standart);
    setVipPrice(hallData.hall_price_vip);
    setHasChanges(false);
  }, [hallData]);

  const saveChanges = () => {
    const updatedHallData: IHall = {
      ...hallData,
      hall_price_standart: standardPrice,
      hall_price_vip: vipPrice,
    };

    const params = new FormData();
    params.set("priceStandart", standardPrice.toString());
    params.set("priceVip", vipPrice.toString());

    fetch(`https://shfe-diplom.neto-server.ru/price/${hallData.id}`, {
      method: "POST",
      body: params,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        onSave(updatedHallData);
        setShowNotification(true);
      })
      .catch((error) => console.error("Ошибка сохранения цен: ", error));

    setHasChanges(false);
  };

  const updateStandardPrice = (value: string) => {
    if (value === "") {
      setStandardPrice(0);
      setHasChanges(true);
      return;
    }

    const newPrice = parseInt(value, 10);
    if (!isNaN(newPrice)) {
      setStandardPrice(newPrice);
      setHasChanges(true);
    }
  };

  const updateVipPrice = (value: string) => {
    if (value === "") {
      setVipPrice(0);
      setHasChanges(true);
      return;
    }

    const newPrice = parseInt(value, 10);
    if (!isNaN(newPrice)) {
      setVipPrice(newPrice);
      setHasChanges(true);
    }
  };

  const cancelChanges = () => {
    setStandardPrice(hallData.hall_price_standart);
    setVipPrice(hallData.hall_price_vip);
    setHasChanges(false);
    onCancel();
  };

  return (
    <div className="price-config">
      <div className="price-config__controls">
        <div className="price-config__header">Настройка цен на билеты</div>
        <div className="price-config__inputs">
          <div className="price-config__input">
            <label>
              Цена, руб:
              <div className="price-config__input-container">
                <input
                  type="number"
                  value={standardPrice || ""}
                  inputMode="numeric"
                  min="1"
                  max="2000"
                  onChange={(e) => updateStandardPrice(e.target.value)}
                  onBlur={() => {
                    if (!standardPrice || standardPrice < 1) setStandardPrice(1);
                    if (standardPrice > 2000) setStandardPrice(2000);
                  }}
                />
                <div className="price-config__seat-type">Обычные кресла</div>
              </div>
            </label>
          </div>
          <div className="price-config__input">
            <label>
              Цена, руб:
              <div className="price-config__input-container">
                <input
                  type="number"
                  value={vipPrice || ""}
                  inputMode="numeric"
                  min="1"
                  max="2000"
                  onChange={(e) => updateVipPrice(e.target.value)}
                  onBlur={() => {
                    if (!vipPrice || vipPrice < 1) setVipPrice(1);
                    if (vipPrice > 2000) setVipPrice(2000);
                  }}
                />
                <div className="price-config__seat-type">VIP кресла</div>
              </div>
            </label>
          </div>
        </div>
      </div>
      {hasChanges && (
        <div className="price-config__buttons">
          <button onClick={cancelChanges}>Отмена</button>
          <button onClick={saveChanges}>Сохранить</button>
        </div>
      )}
      {showNotification && (
        <Notification
          message="Цены успешно обновлены!"
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
};