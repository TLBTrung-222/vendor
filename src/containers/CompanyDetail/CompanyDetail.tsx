import React, { use, useEffect, useState } from "react";
import "./CompanyDetail.scss";
import { useTranslation } from "react-i18next";
import {
  Alert,
  AutoComplete,
  Button,
  Checkbox,
  Col,
  Input,
  Row,
  Select,
  Slider,
  Tabs,
  Tag,
  Typography,
  type TabsProps,
} from "antd";
import { vendorAPI } from "../../services/vendorAPI";
import Helpers from "../../utils/Helpers";
import {
  DeleteOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  PlusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { Box, positions } from "@mui/system";
import { postcodeList } from "../../utils/PostalcodeList";
import { MapOutlined } from "@mui/icons-material";
import { usePusher } from "../../contexts/PusherContext";
import NotiItem from "../../pages/NotiItem/NotiItem";
import PostcodeMap from "../../components/PostcodeMap/PostcodeMap";
import StateMap from "../../components/StateMap/StateMap";

interface ICompanyDetail {
  vendor: any;
  companyDetailForm: any;
  setCompanyDetailForm: (form: any) => void;
  setIsEditing: (isEditing: boolean) => void;
  setNotiItems: (items: any) => void;
}

interface IFederalState {
  id: number;
  german_name: string;
  english_name: string;
}

interface RepresentativePosition {
  position_id: number;
  description: string | null;
  title: string;
}

const CompanyDetail: React.FC<ICompanyDetail> = ({
  vendor,
  companyDetailForm,
  setCompanyDetailForm,
  setIsEditing,
  setNotiItems,
}) => {
  const { t } = useTranslation();
  const [countries, setCountries] = useState<any[]>([]);
  const [legalForms, setLegalForms] = useState<any[]>([]);
  const [tradeOptions, setTradeOptions] = useState<any[]>([]);
  const [newPostalCode, setNewPostalCode] = useState({
    code: "",
    radius: 1,
  });
  const [postalCode, setPostalCode] = useState<
    { code: string; radius: number }[]
  >([]);
  const [federalStates, setFederalStates] = useState<IFederalState[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<number[]>([]);
  const [region, setRegion] = useState("");
  const [positions, setPositions] = useState<RepresentativePosition[]>([]);

  const { message, playNoti } = usePusher();

  useEffect(() => {
    const fetchFederalStates = async () => {
      try {
        const response = await vendorAPI.getStates();
        if (response.data.data) {
          setFederalStates(response.data.data);
        }
      } catch (error) {
        Helpers.notification.error(t("failedToLoadStates"));
      }
    };

    fetchFederalStates();
  }, []);

  useEffect(() => {
    if (message) {
      if (message.changes) {
        message.changes.forEach((change: any) => {
          if (change?.field === "trades") {
            setCompanyDetailForm((prevForm: any) => {
              let updatedTrades = [...prevForm.trades];
              const added = change.added || [];
              const removed = change.removed || [];
              const updated = change.updated || [];
              if (removed.length > 0) {
                updatedTrades = updatedTrades.filter(
                  (trade) =>
                    !removed.some(
                      (r: any) => r.gewerk_id === trade.gesys_gewerk_id
                    )
                );
              }
              if (added.length > 0) {
                added.forEach((a: any) => {
                  updatedTrades.push({
                    trade:
                      tradeOptions.find(
                        (t) => t.gesys_gewerk_id === a.gewerk_id
                      )?.gewerk_name || "",
                    count: a.employee_number,
                    gesys_gewerk_id: a.gewerk_id,
                  });
                });
              }
              if (updated.length > 0) {
                updated.forEach((u: any) => {
                  const index = updatedTrades.findIndex(
                    (trade) => trade.gesys_gewerk_id === u.gewerk_id
                  );
                  if (index !== -1) {
                    updatedTrades[index] = {
                      ...updatedTrades[index],
                      count: u.new_employee_number,
                      gesys_gewerk_id: u.gewerk_id,
                    };
                  }
                });
              }
              return {
                ...prevForm,
                trades: updatedTrades,
              };
            });
          }
        });
      }
      if (message?.detail?.description) {
        setCompanyDetailForm((prevForm: any) => ({
          ...prevForm,
          onboardingStatus: message?.detail?.description,
        }));
        setCompanyDetailForm((prevForm: any) => ({
          ...prevForm,
          pmName: `${message?.detail?.updated_by?.first_name} ${message?.detail?.updated_by?.last_name}`,
        }));
        setCompanyDetailForm((prevForm: any) => ({
          ...prevForm,
          updateDate: new Date(
            message?.detail?.updated_by?.created_at
          ).toLocaleDateString(),
        }));
      }
      playNoti();
      const newMessageItem = {
        key: Math.random(),
        label: (
          <NotiItem message={message?.events ? message.events[0] : message} />
        ),
      };
      setNotiItems((prev: any) => [newMessageItem, ...prev!]);
    }
  }, [message]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await vendorAPI.getCountries();
        setCountries(response.data.data);
      } catch (error) {
        Helpers.notification.error(t("failedToLoadCountries"));
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchLegalForms = async () => {
      if (!companyDetailForm.country) return;
      try {
        const selectedCountry = countries.find(
          (c) => c.country_id === companyDetailForm.country
        );
        if (!selectedCountry) return;
        const response = await vendorAPI.getLegalForms(
          selectedCountry?.country_id
        );
        setLegalForms(response.data.data);
        setCompanyDetailForm({
          ...companyDetailForm,
          legalForms: response.data.data,
        });
      } catch (error) {
        Helpers.notification.error(t("failedToLoadLegalForms"));
      }
    };

    fetchLegalForms();
  }, [companyDetailForm.country]);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await vendorAPI.getTrades();
        setTradeOptions(response.data.data);
      } catch (error) {
        Helpers.notification.error(t("failedToLoadTrades"));
      }
    };

    fetchTrades();
  }, []);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await vendorAPI.getPositions();
        setPositions(response.data.data);
      } catch (error) {
        Helpers.notification.error(t("failedToLoadPositions"));
      }
    };

    fetchPositions();
  }, []);

  const filterOptions = (inputValue: string, option?: any) => {
    return option?.label?.toLowerCase().startsWith(inputValue.toLowerCase());
  };

  const regions: TabsProps["items"] = [
    {
      key: "1",
      label: (
        <span className="region-label">
          <EnvironmentOutlined /> Postcode
        </span>
      ),
      children: (
        <div className="region-content">
          If you cover entire states, switch to the States tab.
          {/* <AutoComplete
            options={postcodeList.map((pc) => ({
              value: pc.code,
              label: pc.label,
            }))}
            filterOption={filterOptions}
            value={newPostalCode.code}
            onChange={(value) => {
              setNewPostalCode({ ...newPostalCode, code: value });
            }}
            onSelect={(value) => {
              const selected = postcodeList.find((pc) => pc.code === value);
              if (!selected) return;

              if (postalCode.some((pc) => pc.code === value)) {
                Helpers.notification.warning("Postcode already added.");
                return;
              }

              setPostalCode((prev) => [...prev, { code: value, radius: 100 }]);

              setNewPostalCode({ code: "", radius: 100 });
            }}
          >
            <Input placeholder="Select Postal Code" />
          </AutoComplete>
          {postalCode &&
            postalCode.map((_, index) => (
              <div key={index} className="postal-code-item">
                {postalCode[index].code}
                <div className="radius-slider">
                  <Slider
                    value={postalCode[index].radius}
                    aria-label="Small"
                    onChange={(value) => {
                      const updatedPostalCode = [...postalCode];
                      updatedPostalCode[index].radius = value as number;
                      setPostalCode(updatedPostalCode);
                    }}
                    min={1}
                    max={500}
                  />
                  Radius: {postalCode[index].radius} km
                </div>
                <Button
                  variant="text"
                  onClick={() => {
                    setPostalCode((prev) =>
                      prev.filter((_item, idx) => idx !== index)
                    );
                  }}
                  style={{ border: "none", color: "red" }}
                >
                  Remove
                </Button>
              </div>
            ))} */}
          <PostcodeMap />
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <span className="region-label">
          <MapOutlined /> States
        </span>
      ),
      children: (
        <div className="region-content">
          If you operate in specific postal code areas, switch to the Postcode
          tab.
          <div
            className="region-checkbox-group"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            <StateMap />
            {federalStates.map((state) => (
              <div key={state.id} className="region-checkbox">
                <Checkbox
                  checked={selectedRegions.includes(state.id)}
                  onChange={(e) => {
                    const selectedValues = e.target.checked
                      ? [...selectedRegions, state.id]
                      : selectedRegions.filter((id) => id !== state.id);
                    setSelectedRegions(selectedValues);
                  }}
                />{" "}
                {state.german_name} ({state.english_name})
              </div>
            ))}
          </div>
          <div className="region-tag-group">
            {selectedRegions.map((id) => (
              <Tag
                className="region-tag"
                key={id}
                closable
                onClose={() => {
                  setSelectedRegions((prev) =>
                    prev.filter((regionId) => regionId !== id)
                  );
                }}
                style={{
                  marginRight: 8,
                  marginTop: 8,
                  backgroundColor: "rgba(245, 124, 0, 0.1)",
                  color: "#f57c00",
                }}
              >
                {federalStates.find((s) => s.id === id)?.german_name} (
                {federalStates.find((s) => s.id === id)?.english_name})
              </Tag>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <span className="region-label">
          <GlobalOutlined />
          Nationwide
        </span>
      ),
      children: <div>Your services reach the whole country</div>,
    },
  ];

  const addTrade = () => {
    setCompanyDetailForm({
      ...companyDetailForm,
      trades: [...companyDetailForm.trades, { trade: "", count: "" }],
    });
  };

  const handleDeleteTrade = (index: number) => {
    const updatedTrades = [...companyDetailForm.trades];
    updatedTrades.splice(index, 1);
    setCompanyDetailForm({
      ...companyDetailForm,
      trades: updatedTrades,
    });
  };

  return (
    <div className="CompanyDetail">
      <div className="info-box">{t("infoBox")}</div>

      {companyDetailForm?.onboardingStatus && (
        <div
          style={{
            marginBottom: 24,
            borderLeft: "5px solid #D74141",
          }}
        >
          <div>{companyDetailForm.onboardingStatus} </div>
          <div style={{ fontSize: "caption", color: "text.secondary" }}>
            {t("RejectedBy")} <b>{companyDetailForm.pmName}</b> {t("on")}{" "}
            <b>{companyDetailForm.updateDate}</b>
          </div>
        </div>
      )}

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div className="label">
            {t("country")}
            <span className="text-danger">*</span>
          </div>
          <Select
            size="large"
            value={companyDetailForm.country || ""}
            className="select"
            onChange={(value) => {
              setCompanyDetailForm({ ...companyDetailForm, country: value });
              setIsEditing(true);
            }}
            disabled={vendor?.country_name !== null}
            options={countries.map((country) => ({
              value: country.country_id,
              label: t(country.name),
            }))}
          />
        </Col>

        <Col span={24}>
          <div className="label">
            {t("company")}
            <span className="text-danger">*</span>
          </div>
          <Input
            size="large"
            value={companyDetailForm.companyName || ""}
            onChange={(e) => {
              setCompanyDetailForm({
                ...companyDetailForm,
                companyName: e.target.value,
              });
              setIsEditing(true);
            }}
          />
        </Col>

        <Col span={24}>
          <div className="label">
            {t("legalForm")}
            <span className="text-danger">*</span>
          </div>
          <Select
            size="large"
            value={
              legalForms.find(
                (form) => form.legal_form_id === companyDetailForm.legalFormId
              )?.title || ""
            }
            onChange={(e) => {
              setCompanyDetailForm({
                ...companyDetailForm,
                legalFormId: legalForms.find((form) => form.title === e)
                  ?.legal_form_id,
              });
              setIsEditing(true);
            }}
            disabled={companyDetailForm.country === ""}
            options={legalForms?.map((form: any) => ({
              value: form.title,
              label: `${form.title} (${form.description})`,
            }))}
          />
        </Col>

        <Col span={24}>
          <div className="label">
            {t("taxId")}
            <span className="text-danger">*</span>
          </div>
          <Input
            size="large"
            value={companyDetailForm.taxId || ""}
            onChange={(e) => {
              setCompanyDetailForm({
                ...companyDetailForm,
                taxId: e.target.value,
              });
              setIsEditing(true);
            }}
          />
        </Col>

        <Col span={12}>
          <div className="label">
            {t("street")}
            <span className="text-danger">*</span>
          </div>
          <Input
            size="large"
            value={companyDetailForm.street || ""}
            onChange={(e) => {
              setCompanyDetailForm({
                ...companyDetailForm,
                street: e.target.value,
              });
              setIsEditing(true);
            }}
          />
        </Col>

        <Col span={12}>
          <div className="label">
            {t("houseNr")}
            <span className="text-danger">*</span>
          </div>
          <Input
            size="large"
            value={companyDetailForm.houseNumber || ""}
            onChange={(e) => {
              setCompanyDetailForm({
                ...companyDetailForm,
                houseNumber: e.target.value,
              });
              setIsEditing(true);
            }}
          />
        </Col>

        <Col span={12}>
          <div className="label">
            {t("apartmentNr")}
            {companyDetailForm.country === "Poland" && (
              <span className="text-danger">*</span>
            )}
          </div>
          <Input
            size="large"
            value={companyDetailForm.apartmentNumber || ""}
            onChange={(e) => {
              setCompanyDetailForm({
                ...companyDetailForm,
                apartmentNumber: e.target.value,
              });
              setIsEditing(true);
            }}
          />
        </Col>

        <Col span={12}>
          <div className="label">
            {t("zip")}
            <span className="text-danger">*</span>
          </div>
          <Input
            size="large"
            value={companyDetailForm.zipCode || ""}
            onChange={(e) => {
              setCompanyDetailForm({
                ...companyDetailForm,
                zipCode: e.target.value,
              });
              setIsEditing(true);
            }}
          />
        </Col>

        <Col span={24}>
          <div className="label">
            {t("city")}
            <span className="text-danger">*</span>
          </div>
          <Input
            size="large"
            value={companyDetailForm.city || ""}
            onChange={(e) => {
              setCompanyDetailForm({
                ...companyDetailForm,
                city: e.target.value,
              });
              setIsEditing(true);
            }}
          />
        </Col>

        <Col span={24}>
          <div className="label">{t("website")}</div>
          <Input
            size="large"
            value={companyDetailForm.website || ""}
            onChange={(e) => {
              setCompanyDetailForm({
                ...companyDetailForm,
                website: e.target.value,
              });
              setIsEditing(true);
            }}
          />
        </Col>

        {/* Employees per Trade section */}
        <Col span={24}>
          <div className="label">
            {t("tradeTitle")}
            <span className="text-danger">*</span>
          </div>
          {companyDetailForm.trades.map((item, i) => (
            <Row gutter={[16, 16]} key={i} style={{ margin: "12px 0" }}>
              <Col span={11} style={{ paddingLeft: 0 }}>
                <Select
                  size="large"
                  value={item.trade}
                  onChange={(e) => {
                    setCompanyDetailForm({
                      ...companyDetailForm,
                      trades: companyDetailForm.trades.map((trade, idx) =>
                        idx === i ? { ...trade, trade: e } : trade
                      ),
                    });
                    setIsEditing(true);
                  }}
                  disabled={!!item.gesys_gewerk_id}
                  style={{ width: "100%" }}
                  options={tradeOptions.map((trade) => ({
                    value: trade.gewerk_name,
                    label: t(trade.gewerk_name.replace(/\s+/g, "")),
                  }))}
                />
              </Col>
              <Col span={11}>
                <Input
                  size="large"
                  value={companyDetailForm.trades[i].count || ""}
                  onChange={(e) => {
                    setCompanyDetailForm({
                      ...companyDetailForm,
                      trades: companyDetailForm.trades.map((trade, idx) =>
                        idx === i ? { ...trade, count: e.target.value } : trade
                      ),
                    });
                    setIsEditing(true);
                  }}
                />
              </Col>
              <Col span={2}>
                <Button
                  size="large"
                  type="link"
                  disabled={
                    companyDetailForm.trades.length === 1 && item.trade === ""
                  }
                  onClick={() => {
                    handleDeleteTrade(i);
                    if (companyDetailForm.trades.length === 1) {
                      setCompanyDetailForm({
                        ...companyDetailForm,
                        trades: [
                          {
                            trade: "",
                            count: "",
                          },
                        ],
                      });
                    }
                  }}
                  style={{ color: "red" }}
                >
                  <DeleteOutlined />
                </Button>
              </Col>
            </Row>
          ))}

          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={addTrade}
            style={{ borderRadius: 8, padding: 0, color: "#f57c00" }}
          >
            {t("addTrade")}
          </Button>
        </Col>

        {/* Regions Covered field - Multiple Select */}
        <Col span={24}>
          <div className="label">
            {t("regions")}
            <span className="text-danger">*</span>
          </div>
          <Tabs
            items={regions}
            activeKey={region}
            onChange={(key) => {
              setRegion(key);
              const selectedRegion = regions.find((item) => item.key === key);
              if (selectedRegion) {
                setCompanyDetailForm({
                  ...companyDetailForm,
                  region: key,
                  regionsCovered:
                    selectedRegion.key === "1"
                      ? postalCode
                      : selectedRegion.key === "2"
                      ? selectedRegions
                      : "nationwide",
                });
              }
            }}
          />
        </Col>

        <Col span={24}>
          <div className="label">
            {t("legalRep")}
            <span className="text-danger">*</span>
          </div>
        </Col>

        <Col span={12}>
          <div className="label">
            {t("firstName")}
            <span className="text-danger">*</span>
          </div>
          <Input
            size="large"
            value={companyDetailForm.firstName || ""}
            onChange={(e) => {
              setCompanyDetailForm({
                ...companyDetailForm,
                firstName: e.target.value,
              });
              setIsEditing(true);
            }}
          />
        </Col>

        <Col span={12}>
          <div className="label">
            {t("lastName")}
            <span className="text-danger">*</span>
          </div>
          <Input
            size="large"
            value={companyDetailForm.lastName || ""}
            onChange={(e) => {
              setCompanyDetailForm({
                ...companyDetailForm,
                lastName: e.target.value,
              });
              setIsEditing(true);
            }}
          />
        </Col>

        <Col span={12}>
          <div className="label">
            {t("email")}
            <span className="text-danger">*</span>
          </div>
          <Input
            disabled
            size="large"
            value={companyDetailForm.email || ""}
            onChange={(e) => {
              setCompanyDetailForm({
                ...companyDetailForm,
                email: e.target.value,
              });
              setIsEditing(true);
            }}
          />
        </Col>

        <Col span={12}>
          <div className="label">
            {t("phone")}
            <span className="text-danger">*</span>
          </div>
          <Input
            size="large"
            value={companyDetailForm.phone || ""}
            onChange={(e) => {
              setCompanyDetailForm({
                ...companyDetailForm,
                phone: e.target.value,
              });
              setIsEditing(true);
            }}
          />
        </Col>

        <Col span={24}>
          <div className="label">
            {t("position")}
            <span className="text-danger">*</span>
          </div>
          <Select
            size="large"
            value={companyDetailForm.selectedPosition || ""}
            style={{ width: "100%" }}
            onChange={(e) => {
              setCompanyDetailForm({
                ...companyDetailForm,
                selectedPositionId: positions.find((pos) => pos.title === e)
                  ?.position_id,
                selectedPosition: e,
              });
              setIsEditing(true);
            }}
            options={
              positions.map((position) => ({
                value: position.title,
                label: t(position.title.replace(/\s+/g, "")),
              })) || []
            }
          />
        </Col>
      </Row>
    </div>
  );
};

export default CompanyDetail;
