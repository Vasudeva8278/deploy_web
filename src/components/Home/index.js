import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext"; // adjust path if needed
import { Routes, Route, useLocation } from "react-router-dom";
import Navigation from "../Navigation";
import TemplatesSidebar from "../TemplatesSidebar.tsx";
import ProfileSettings from "../Profile/ProfileSettings";
import Dashboard from "../Dashboard/Dashboard";
import DocxToTextConverter from "../Template/DocxToTextConverter";
import ExportComponent from "../Documents/ExportComponent";
import DocumentView from "../Documents/DocumentView";
import DocumentContainer from "../Documents/DocumentContainer";
import NeoDocements from "../NeoDocements";
import ProfileHeader from "../profileheader";
import ListofDocuments from "../Documents/ListofDocument";
import Projects from "../../pages/Projects";
import NeoProTemplates from "../NeoProTemplates.jsx";
import ViewTemplatesHighlights from "../Template/ViewTemplatesHighlights";
import Clients from "../../pages/Clients";
import ViewClient from "../../pages/ViewClient";
import LandingPage from "../../pages/LandingPage.tsx";
import UserManage from "../../pages/UserManage";
import RoleFeatureManagement from "../RoleFeatureManagement";  
import NeoTemplates from "../NeoTemplate";
import DocumentSideBar from "../DocumentSideBar.js";
import NeoProjectTemplates from "../NeoProjectTemplates.jsx";
import HtmlParserTool from "../HtmlParseTool";
const Home = () => {
  const [isNavigationVisible, setIsNavigationVisible] = useState(true);
  const [roleFeatures, setRoleFeatures] = useState([]);
  const [featuresLoading, setFeaturesLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();


  const EXECUTIVE_ROLE_ID = "68621597db15fbb9bbd2f838";
  const EXPERT_ROLE_ID = "68621581db15fbb9bbd2f836";

  // Get user from context or localStorage
  const { user } = useContext(AuthContext);
  const roleId = user?.role || localStorage.getItem("role");
  
  // Check if user is admin (has admin in role name)
  const isAdmin = user?.roleName?.toLowerCase().includes('admin') || 
                  user?.role?.toLowerCase().includes('admin') ||
                  roleId?.toLowerCase().includes('admin');
  
  // Show sidebar for all users except EXECUTIVE and EXPERT roles, or if user is admin
  const shouldShowSidebar = isAdmin || ![EXECUTIVE_ROLE_ID, EXPERT_ROLE_ID].includes(roleId);

  useEffect(() => {
    const fetchRoleFeatures = async () => {
      if (roleId) {
        try {
          const API_URL = process.env.REACT_APP_API_URL || "http://13.200.200.137:7000";
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

  const isNeoTemplates = location.pathname.startsWith('/NeoTemplates');
  const isNeoDocuments = location.pathname.startsWith('/NeoDocements');
  const isNeoProjectTemplates = /^\/projects\/[^/]+$/.test(location.pathname);
  const isNeoProjectDocuments = /^\/NeoDocuments\/[^/]+$/.test(location.pathname);

  // Helper function to check if user has access to a feature
  const hasFeatureAccess = (featureKey) => {
    // Admin users have access to all features
    if (isAdmin) {
      return true;
    }
    return roleFeatures.includes(featureKey);
  };

  if (featuresLoading) return null; // or a spinner

  return (
    <div className='flex flex-col h-screen'>
      <div>
        <ProfileHeader />
      </div>
      
      
      
      <div className='flex flex-1'>
    {/* LEFT: Navigation Sidebar */}
    {isNavigationVisible && !isMobile && (
      <div className='w-20 flex-shrink-0'>
        <Navigation />
      </div>
    )}

    {/* LEFT: TemplatesSidebar */}
    {!isMobile && shouldShowSidebar && (isNeoTemplates || isNeoProjectTemplates) && (
      <div className='w-44 flex-shrink-0'>
        <TemplatesSidebar />
      </div>
    )}

    {/* LEFT: DocumentSideBar */}
    {!isMobile && shouldShowSidebar && (isNeoDocuments || isNeoProjectDocuments) && (
      <div className='w-44 flex-shrink-0'>
        <DocumentSideBar />
      </div>
    )}





<div className="flex-1 p-2 overflow-auto bg-gray-50 rounded-3xl mt-16 border-2 border-gray-200 mr-2 ml-2">
            

          
          
          <Routes>
            {hasFeatureAccess('Users') && (
              <Route path='/user-manage' element={<UserManage />} />
            )}
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/' element={<LandingPage />} />
            <Route path='/NeoTemplates' element={<NeoTemplates />} />
            <Route path='/NeoDocements' element={<NeoDocements />} />
            {hasFeatureAccess('Templates') && (
              <Route path='/document/:id' element={<DocxToTextConverter />} />
            )}
              {hasFeatureAccess('Templates') && (
              <Route path='/htmlparser' element={<HtmlParserTool />} />
            )}
            {hasFeatureAccess('Templates') && (
              <Route path='/htmlparser/:id' element={<HtmlParserTool />} />
            )}
            {hasFeatureAccess('Documents') && (
              <Route path='/docview/:id' element={<DocumentView />} />
            )}
            {hasFeatureAccess('Documents') && (
              <Route path='/docviewall/:id' element={<DocumentContainer />} />
            )}
            {hasFeatureAccess('Documents') && (
              <Route path='/listView' element={<ListofDocuments />} />
            )}
            {hasFeatureAccess('Documents') && (
              <Route
                path='/export/:id'
                element={
                  <div>
                    <ExportComponent />
                  </div>
                }
              />
            )}
            {hasFeatureAccess('projects') && (
              <Route path='/projects' element={<Projects />} />
            )}
            {hasFeatureAccess('Clients') && (
              <Route path='/clients' element={<Clients />} />
            )}
            <Route path='/profile' element={<ProfileSettings />} />
            {hasFeatureAccess('Clients') && (
              <Route path='/viewclient' element={<ViewClient />} />
            )}
            {hasFeatureAccess('projects') && (
              <Route path='/NeoTemplates/:id' element={<NeoProTemplates />} />
            )}
         
         {hasFeatureAccess('projects') && (
              <Route path='/NeoDocements/:id' element={<NeoProjectTemplates />} />
            )}

            {hasFeatureAccess('Users') && (
              <Route path='/UserManage' element={<UserManage />} />
            )}
            <Route path='/RoleFeatureManagement' element={<RoleFeatureManagement />} />
            {hasFeatureAccess('Templates') && (
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


