import React, { use, useEffect, useMemo, useState } from "react";
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
  BulbFilled,
  DeleteOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  PlusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
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
  const [federalStates, setFederalStates] = useState<IFederalState[]>([]);
  const [region, setRegion] = useState(companyDetailForm.region || "1");
  const [positions, setPositions] = useState<RepresentativePosition[]>([]);

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

    if (!federalStates) {
      fetchFederalStates();
    }
  }, [federalStates]);

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
        const countryId = companyDetailForm.country;
        const response = await vendorAPI.getLegalForms(countryId);
        setLegalForms(response.data.data);
        setCompanyDetailForm((prevForm: any) => ({
          ...prevForm,
          legalForms: response.data.data,
        }));
      } catch (error) {
        Helpers.notification.error(t("failedToLoadLegalForms"));
      }
    };

    fetchLegalForms();
  }, [companyDetailForm.country, countries]);

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

  const postcodeOptions = useMemo(() => {
    const seen = new Set<string>();

    return postcodeList
      .filter((pc) => {
        if (seen.has(pc.code)) return false;
        seen.add(pc.code);
        return true;
      })
      .map((pc) => ({
        label: pc.label,
        value: pc.code,
      }));
  }, []);

  const [newPostalCode, setNewPostalCode] = useState<{
    code: string;
    radius: number;
  }>({
    code: "",
    radius: 20,
  });

  useEffect(() => {
    if (!federalStates || federalStates.length === 0) return;
    setCompanyDetailForm((prevForm: any) => ({
      ...prevForm,
      selectedRegions: federalStates
        .filter((state) => companyDetailForm.selectedRegions.includes(state.id))
        .map((state) => state.id),
    }));
  }, [companyDetailForm.selectedRegions, federalStates]);

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
          <div className="info-box mb-1">
            <BulbFilled color="yellow" /> You can add{" "}
            <b>multiple postal codes</b> to define your coverage areas. Each
            gets its own radius!
          </div>
          <div className="d-flex gap-2">
            <AutoComplete
              options={postcodeOptions}
              filterOption={(input, option) =>
                option?.label.toLowerCase().includes(input.toLowerCase()) ||
                option?.value.includes(input)
              }
              value={newPostalCode.code}
              onChange={(value) => {
                setNewPostalCode({ ...newPostalCode, code: value });
              }}
              onSelect={(value) => {
                const selected = postcodeList.find((pc) => pc.code === value);
                if (!selected) return;

                if (
                  companyDetailForm.postalCode.some((pc) => pc.code === value)
                ) {
                  Helpers.notification.warning("Postcode already added.");
                  return;
                }

                setCompanyDetailForm((prev) => ({
                  ...prev,
                  postalCode: [
                    ...prev.postalCode,
                    { code: value, radius: 100 },
                  ],
                }));

                setNewPostalCode({ code: "", radius: 100 });
              }}
            >
              <div className="d-flex gap-2">
                <Input placeholder="Select Postal Code" />
                <Button type="primary" icon={<PlusCircleOutlined />}>
                  Add Postcode{" "}
                </Button>
              </div>
            </AutoComplete>
          </div>
          <PostcodeMap
            selectedPostcode={companyDetailForm.postalCode}
            setSelectedPostcode={(value) =>
              setCompanyDetailForm((prev) => ({
                ...prev,
                postalCode:
                  typeof value === "function" ? value(prev.postalCode) : value,
              }))
            }
            setIsEditing={setIsEditing}
          />
          {companyDetailForm.postalCode &&
            companyDetailForm.postalCode.map((_, index) => (
              <div key={index} className="postal-code-item">
                {postcodeList.find(
                  (pc) => pc.code === companyDetailForm.postalCode[index].code
                )?.label || companyDetailForm.postalCode[index].code}
                <div className="radius-slider">
                  <Slider
                    value={companyDetailForm.postalCode[index].radius}
                    aria-label="Small"
                    onChange={(value) => {
                      const updatedPostalCode = [
                        ...companyDetailForm.postalCode,
                      ];
                      updatedPostalCode[index].radius = value as number;
                      setCompanyDetailForm((prev) => ({
                        ...prev,
                        postalCode: updatedPostalCode,
                      }));
                    }}
                    min={1}
                    max={500}
                  />
                  Radius: {companyDetailForm.postalCode[index].radius} km
                </div>
                <Button
                  variant="text"
                  onClick={() => {
                    setCompanyDetailForm((prev) => ({
                      ...prev,
                      postalCode: prev.postalCode.filter(
                        (_item, idx) => idx !== index
                      ),
                    }));
                  }}
                  style={{ border: "none", color: "red" }}
                >
                  Remove
                </Button>
              </div>
            ))}
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
          <div className="region-checkbox-group">
            <StateMap
              selectedRegions={companyDetailForm.selectedRegions}
              setSelectedRegions={(newSelectedRegions: any) =>
                setCompanyDetailForm((prev: any) => ({
                  ...prev,
                  selectedRegions: newSelectedRegions,
                }))
              }
              setIsEditing={setIsEditing}
            />
            {federalStates.map((state) => (
              <div key={state.id} className="region-checkbox">
                <Checkbox
                  checked={companyDetailForm.selectedRegions.includes(state.id)}
                  onChange={(e) => {
                    const selectedValues = e.target.checked
                      ? [...companyDetailForm.selectedRegions, state.id]
                      : companyDetailForm.selectedRegions.filter(
                          (id) => id !== state.id
                        );
                    setCompanyDetailForm((prev: any) => ({
                      ...prev,
                      selectedRegions: selectedValues,
                    }));
                  }}
                />{" "}
                {state.german_name} ({state.english_name})
              </div>
            ))}
          </div>
          {/* <div className="region-tag-group">
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
          </div> */}
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <span className="region-label">
          <GlobalOutlined /> {t("nationwide")}
        </span>
      ),
      children: <div>Your services reach the whole country</div>,
    },
  ];

  const addTrade = () => {
    setCompanyDetailForm({
      ...companyDetailForm,
      trades: [...companyDetailForm.trades, { gesys_gewerk_id: "", count: 0 }],
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
        <div className="deny-box">
          <div>{companyDetailForm.onboardingStatus} </div>
          <div>
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
                  value={item.gesys_gewerk_id}
                  onChange={(e) => {
                    setCompanyDetailForm({
                      ...companyDetailForm,
                      trades: companyDetailForm.trades.map((trade, idx) =>
                        idx === i ? { ...trade, gesys_gewerk_id: e } : trade
                      ),
                    });
                    setIsEditing(true);
                  }}
                  disabled={!!item.gesys_gewerk_id}
                  style={{ width: "100%" }}
                  options={tradeOptions
                    .filter(
                      (tradeOption) =>
                        !companyDetailForm.trades.some(
                          (trade: any) =>
                            trade.gesys_gewerk_id ===
                            tradeOption.gesys_gewerk_id
                        ) ||
                        tradeOption.gesys_gewerk_id === item.gesys_gewerk_id
                    )
                    .map((trade) => ({
                      value: trade.gesys_gewerk_id,
                      label: t(trade.gewerk_name.replace(/\s+/g, "")),
                    }))}
                />
              </Col>
              <Col span={11}>
                <Input
                  size="large"
                  value={companyDetailForm.trades[i].count}
                  onChange={(e) => {
                    setCompanyDetailForm({
                      ...companyDetailForm,
                      trades: companyDetailForm.trades.map((trade, idx) =>
                        idx === i
                          ? { ...trade, count: Number(e.target.value) }
                          : trade
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
                            gesys_gewerk_id: "",
                            count: 0,
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
            activeKey={companyDetailForm.region}
            onChange={(key) => {
              setRegion(key);
              setIsEditing(true);
              const selectedRegion = regions.find((item) => item.key == key);
              if (selectedRegion) {
                setCompanyDetailForm({
                  ...companyDetailForm,
                  region: key,
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
