import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext"; // adjust path if needed
import { Routes, Route, useLocation } from "react-router-dom";
import Navigation from "../Navigation";
import TemplatesSidebar from "../TemplatesSidebar.tsx";
import ProfileSettings from "../Profile/ProfileSettings";
import Dashboard from "../Dashboard/Dashboard";
import MainPage from "../MainPage";
import Homepage from "../Homepage";
import Neo from "../../components/Neo";
import DocxToTextConverter from "../Template/DocxToTextConverter";
import ExportComponent from "../Documents/ExportComponent";
import DocumentView from "../Documents/DocumentView";
import DocumentContainer from "../Documents/DocumentContainer";
import NeoTemplate from "../NeoTemplate";
import NeoDocements from "../NeoDocements";
import ProfileHeader from "../profileheader";
import ListofDocuments from "../Documents/ListofDocument";
import Projects from "../../pages/Projects";
import NeoProjectTemplates from "../NeoProjectTemplates";
import ViewTemplatesHighlights from "../Template/ViewTemplatesHighlights";
import Clients from "../../pages/Clients";
import ViewClient from "../../pages/ViewClient";
import LandingPage from "../../pages/LandingPage.tsx";
import UserManage from "../../pages/UserManage";
import RoleFeatureManagement from "../RoleFeatureManagement";  

const Home = () => {
  const [isNavigationVisible, setIsNavigationVisible] = useState(true);
  const [roleFeatures, setRoleFeatures] = useState([]);
  const [featuresLoading, setFeaturesLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();

  // Get user from context or localStorage
  const { user } = useContext(AuthContext);
  const roleId = user?.role || localStorage.getItem("role");

  useEffect(() => {
    const fetchRoleFeatures = async () => {
      if (roleId) {
        try {
          const API_URL = process.env.REACT_APP_API_URL || "http://localhost:7000";
          const res = await axios.get(`${API_URL}/api/roles/${roleId}`);
          setRoleFeatures(res.data.features || []);
        } catch (error) {
          setRoleFeatures([]);
        } finally {
          setFeaturesLoading(false);
        }
      } else {
        setRoleFeatures([]);
        setFeaturesLoading(false);
      }
    };
    fetchRoleFeatures();
  }, [roleId]);

  // Handle screen resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleNavigation = () => {
    setIsNavigationVisible((prevState) => !prevState);
  };

  if (featuresLoading) return null; // or a spinner

  return (
    <div className='flex flex-col h-screen'>
      <div>
        <ProfileHeader />
      </div>
      <div className='flex flex-1'>
        {isNavigationVisible && (
          <div className={`${isMobile ? 'w-20' : 'w-64'} flex-shrink-0`}>
            <Navigation />
          </div>
        )}

        {!isMobile && <TemplatesSidebar />}

        <div className={`flex-1 p-2 overflow-auto bg-gray-50 rounded-3xl mt-16 border-2 border-gray-200 ${
          isMobile ? 'ml-1' : 'ml-2'
        }`}>
          <Routes>
            {roleFeatures.includes('Users') && (
              <Route path='/user-manage' element={<UserManage />} />
            )}
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/' element={<LandingPage />} />
            {roleFeatures.includes('Templates') && (
              <Route path='/Neo' element={<NeoTemplate />} />
            )}
            {roleFeatures.includes('Documents') && (
              <Route path='/NeoDocements' element={<NeoDocements />} />
            )}
            {roleFeatures.includes('Templates') && (
              <Route path='/document/:id' element={<DocxToTextConverter />} />
            )}
            {roleFeatures.includes('Documents') && (
              <Route path='/docview/:id' element={<DocumentView />} />
            )}
            {roleFeatures.includes('Documents') && (
              <Route path='/docviewall/:id' element={<DocumentContainer />} />
            )}
            {roleFeatures.includes('Documents') && (
              <Route path='/listView' element={<ListofDocuments />} />
            )}
            {roleFeatures.includes('Documents') && (
              <Route
                path='/export/:id'
                element={
                  <div>
                    <ExportComponent />
                  </div>
                }
              />
            )}
            {roleFeatures.includes('projects') && (
              <Route path='/projects' element={<Projects />} />
            )}
            {roleFeatures.includes('Clients') && (
              <Route path='/clients' element={<Clients />} />
            )}
            <Route path='/profile' element={<ProfileSettings />} />
            {roleFeatures.includes('Clients') && (
              <Route path='/viewclient' element={<ViewClient />} />
            )}
            {roleFeatures.includes('projects') && (
              <Route path='/projects/:id' element={<NeoProjectTemplates />} />
            )}
            {roleFeatures.includes('Users') && (
              <Route path='/UserManage' element={<UserManage />} />
            )}
            <Route path='/RoleFeatureManagement' element={<RoleFeatureManagement />} />
            {roleFeatures.includes('Templates') && (
              <Route
                path='/viewAllHighlights'
                element={<ViewTemplatesHighlights />}
              />
            )}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Home;
