import React, { createContext, useContext, useState, useRef } from 'react';
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton } from '@coreui/react';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [state, setState] = useState({ visible: false, title: '', message: '', mode: 'alert' });
  const resolverRef = useRef(null);

  const showAlert = (message, title = '') => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({ visible: true, title, message, mode: 'alert' });
    });
  };

  const showConfirm = (message, title = 'Confirmar') => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({ visible: true, title, message, mode: 'confirm' });
    });
  };

  const close = (result) => {
    setState((s) => ({ ...s, visible: false }));
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      <CModal visible={state.visible} onClose={() => close(false)} alignment="center">
        <CModalHeader>
          <CModalTitle>{state.title || (state.mode === 'confirm' ? 'Confirmar' : 'Aviso')}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {typeof state.message === 'string' ? state.message : JSON.stringify(state.message)}
        </CModalBody>
        <CModalFooter>
          {state.mode === 'confirm' ? (
            <>
              <CButton color="secondary" onClick={() => close(false)}>Cancelar</CButton>
              <CButton color="primary" onClick={() => close(true)}>Aceptar</CButton>
            </>
          ) : (
            <CButton color="primary" onClick={() => close(true)}>OK</CButton>
          )}
        </CModalFooter>
      </CModal>
    </ModalContext.Provider>
  );
};

export default ModalContext;
