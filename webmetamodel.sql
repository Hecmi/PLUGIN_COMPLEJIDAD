--
-- PostgreSQL database dump
--

-- Dumped from database version 15.6 (Debian 15.6-1.pgdg120+2)
-- Dumped by pg_dump version 16.4

-- Started on 2025-08-27 00:07:07

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 3500 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 240 (class 1255 OID 166481)
-- Name: get_actions_json(); Type: PROCEDURE; Schema: public; Owner: aplicaciones
--

CREATE PROCEDURE public.get_actions_json(OUT resultado jsonb)
    LANGUAGE plpgsql
    AS $$
BEGIN
    SELECT COALESCE(jsonb_agg(
        json_build_object(
            'id', a.id,
            'name', a.name,
            'args', a.args,
            'body', a.body,
			'isAsync', a.is_async
        )
    ), '[]'::jsonb)
    INTO resultado
    FROM actions a
    WHERE a.deleted_at IS NULL;
END;
$$;


ALTER PROCEDURE public.get_actions_json(OUT resultado jsonb) OWNER TO aplicaciones;

--
-- TOC entry 251 (class 1255 OID 167024)
-- Name: get_metrics_json(); Type: PROCEDURE; Schema: public; Owner: aplicaciones
--

CREATE PROCEDURE public.get_metrics_json(OUT o_result json)
    LANGUAGE plpgsql
    AS $$
BEGIN
    SELECT json_agg(row_data)
    INTO o_result
    FROM (
        SELECT json_build_object(
            'metricId', m.id,
            'code', m.code,
            'name', m.name,
            'weight', m.weight,
            'action', m.action
        ) AS row_data
        FROM metrics m
        WHERE m.deleted_at IS NULL
        ORDER BY m.id
    ) sub;
END;
$$;


ALTER PROCEDURE public.get_metrics_json(OUT o_result json) OWNER TO aplicaciones;

--
-- TOC entry 260 (class 1255 OID 158235)
-- Name: get_model_attributes_json(integer); Type: PROCEDURE; Schema: public; Owner: aplicaciones
--

CREATE PROCEDURE public.get_model_attributes_json(IN i_model_id integer, OUT o_result json)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Realizar la consulta y asignar el resultado al parámetro OUT
    SELECT json_agg(
            json_build_object(
				'attributeId', ma.id,
                'attributeName', ma.name,
				'attributeTranslations', ma.translations,
                'attributeCode', ma.code,
                'dataTypeAttributeId', dta.id,
                'dataTypeAttribute', dta.name,
                'dataTypeId', dt.id,
                'dataType', dt.type,
                'classAttributeId', cma.id,
                'classAttribute', cma.name,
				'classAttribute_ts', cma.translations,
				'isDefault', ma.is_default,
				'position', ma.position,
                'options', CASE 
                    WHEN dta.data_type_id = 2 THEN (
                        SELECT json_agg(
                            json_build_object(
                                'dataListed', ld.data,
								'dataListed_ts', ld.translations,
                                'numericalEquivalent', ld.numerical_equivalent,
								'textEquivalent', ld.text_equivalent
                            ) order by ld.position asc
                        )
                        FROM listed_data ld
                        WHERE ld.data_type_attribute_id = dta.id
							AND ld.deleted_at is null
                    )
                    ELSE NULL
                END
            )
        )
    INTO o_result
    FROM model_attribute ma
	    JOIN class_model_attribute cma ON ma.class_attribute_id = cma.id
	    JOIN data_type_attribute dta ON ma.data_type_attribute_id = dta.id
	    JOIN data_type dt ON dta.data_type_id = dt.id
	WHERE 
		ma.deleted_at is null
		AND cma.deleted_at is null
		AND dta.deleted_at is null
		AND dt.deleted_at is null
		AND (cma.user_model_id = i_model_id OR ma.is_default = true);
END;
$$;


ALTER PROCEDURE public.get_model_attributes_json(IN i_model_id integer, OUT o_result json) OWNER TO aplicaciones;

--
-- TOC entry 258 (class 1255 OID 166426)
-- Name: get_model_user_attributes_json(integer, integer); Type: PROCEDURE; Schema: public; Owner: aplicaciones
--

CREATE PROCEDURE public.get_model_user_attributes_json(IN i_model_id integer, IN i_user_id integer, OUT o_result json)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Realizar la consulta y asignar el resultado al parámetro OUT
    SELECT json_agg(
            json_build_object(
				'attributeId', ma.id,
                'attributeName', ma.name,
				'attributeTranslations', ma.translations,
                'attributeCode', ma.code,
				'textValue', eua.value,
                'dataTypeAttributeId', dta.id,
                'dataTypeAttribute', dta.name,
                'dataTypeId', dt.id,
                'dataType', dt.type,
                'classAttributeId', cma.id,
                'classAttribute', cma.name,
				'classAttribute_ts', cma.translations,
				'isDefault', ma.is_default,
				'position', ma.position,
                'options', CASE 
                    WHEN dta.data_type_id = 2 THEN (
                        SELECT json_agg(
                            json_build_object(
                                'dataListed', ld.data,
								'dataListed_ts', ld.translations,
                                'numericalEquivalent', ld.numerical_equivalent,
								'textEquivalent', ld.text_equivalent
                            ) ORDER BY ld.position asc
                        )
                        FROM listed_data ld
                        WHERE ld.data_type_attribute_id = dta.id
							AND ld.deleted_at is null
                    )
                    ELSE NULL
                END
            )
        )
    INTO o_result
    FROM model_attribute ma
		LEFT JOIN elderly_user_attribute eua ON eua.attribute_id = ma.id
			AND eua.elderly_user_id = i_user_id
	    JOIN class_model_attribute cma ON ma.class_attribute_id = cma.id
		JOIN data_type_attribute dta ON ma.data_type_attribute_id = dta.id
	    JOIN data_type dt ON dta.data_type_id = dt.id
		
	WHERE 
		ma.deleted_at is null
		AND cma.deleted_at is null
		AND dta.deleted_at is null
		AND dt.deleted_at is null
		AND (cma.user_model_id = i_model_id OR ma.is_default = true);
		--AND eua.elderly_user_id = i_user_id;

	IF o_result IS NULL THEN
        o_result := '[]'::json;
    END IF;
END;
$$;


ALTER PROCEDURE public.get_model_user_attributes_json(IN i_model_id integer, IN i_user_id integer, OUT o_result json) OWNER TO aplicaciones;

--
-- TOC entry 254 (class 1255 OID 166482)
-- Name: get_rules_json(); Type: PROCEDURE; Schema: public; Owner: aplicaciones
--

CREATE PROCEDURE public.get_rules_json(OUT resultado jsonb)
    LANGUAGE plpgsql
    AS $$
BEGIN
    SELECT COALESCE(jsonb_agg(
        json_build_object(
            'id', r.id,
            'name', r.name,
            'event', r.event,
            'condition', r.condition,
            'actions', r.actions,
			'rollbackActions', r.rollback_actions,
            'priority', r.priority,
			'translations', r.translations
        )
    ), '[]'::jsonb)
    INTO resultado
    FROM rules r
    WHERE r.deleted_at IS NULL
	GROUP BY r.priority    
	ORDER BY r.priority DESC;
END;
$$;


ALTER PROCEDURE public.get_rules_json(OUT resultado jsonb) OWNER TO aplicaciones;

--
-- TOC entry 257 (class 1255 OID 174618)
-- Name: get_user_attributes_json(integer); Type: PROCEDURE; Schema: public; Owner: aplicaciones
--

CREATE PROCEDURE public.get_user_attributes_json(IN i_user_id integer, OUT o_result json)
    LANGUAGE plpgsql
    AS $$
BEGIN
    SELECT json_object_agg(ma.code, eua.value)
    INTO o_result
    FROM model_attribute ma
        JOIN class_model_attribute cma ON ma.class_attribute_id = cma.id
        JOIN data_type_attribute dta ON ma.data_type_attribute_id = dta.id
        JOIN data_type dt ON dta.data_type_id = dt.id
        JOIN elderly_user_attribute eua ON eua.attribute_id = ma.id
    WHERE 
        ma.deleted_at IS NULL
        AND cma.deleted_at IS NULL
        AND dta.deleted_at IS NULL
        AND dt.deleted_at IS NULL
        AND eua.elderly_user_id = i_user_id;

    IF o_result IS NULL THEN
        o_result := '{}'::json;
    END IF;
END;
$$;


ALTER PROCEDURE public.get_user_attributes_json(IN i_user_id integer, OUT o_result json) OWNER TO aplicaciones;

--
-- TOC entry 256 (class 1255 OID 166427)
-- Name: login_elderly_user(jsonb); Type: PROCEDURE; Schema: public; Owner: aplicaciones
--

CREATE PROCEDURE public.login_elderly_user(IN i_user_data jsonb, OUT o_result jsonb)
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_record RECORD;
  v_user_record RECORD;
BEGIN
  -- Validar que el JSON no sea nulo
  IF i_user_data IS NULL THEN
    o_result := jsonb_build_object(
      'status', 'error',
      'error_code', 'INVALID_JSON',
      'data', NULL
    );
    RETURN;
  END IF;

  -- Descomponer el JSON en un registro
  SELECT * INTO v_record
  FROM jsonb_populate_record(NULL::record, i_user_data) 
  AS (mail TEXT, password TEXT);

  -- Verificar credenciales y obtener datos del usuario
  SELECT id, name, mail INTO v_user_record
  FROM elderly_user
  WHERE mail = TRIM(v_record.mail)
    AND password = TRIM(v_record.password)
    AND deleted_at IS NULL
  LIMIT 1;

  -- Si se encuentra el usuario
  IF v_user_record.id IS NOT NULL THEN
    o_result := jsonb_build_object(
      'status', 'success',
      'data', jsonb_build_object(
        'id', v_user_record.id,
        'name', v_user_record.name,
        'mail', v_user_record.mail
      )
    );
  ELSE
    o_result := jsonb_build_object(
      'status', 'error',
      'error_code', 'INVALID_CREDENTIALS',
      'data', NULL
    );
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    o_result := jsonb_build_object(
      'status', 'error',
      'error_code', 'UNKNOWN_ERROR',
      'message', 'Error inesperado al iniciar sesión: ' || SQLERRM,
      'data', NULL
    );
END;
$$;


ALTER PROCEDURE public.login_elderly_user(IN i_user_data jsonb, OUT o_result jsonb) OWNER TO aplicaciones;

--
-- TOC entry 255 (class 1255 OID 158236)
-- Name: register_elderly_user(jsonb); Type: PROCEDURE; Schema: public; Owner: aplicaciones
--

CREATE PROCEDURE public.register_elderly_user(IN i_user_data jsonb, OUT o_result jsonb)
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_record RECORD;
  v_inserted_id INTEGER;
BEGIN
  -- Validar que el JSON no sea nulo
  IF i_user_data IS NULL THEN
    o_result := jsonb_build_object(
      'status', 'error',
      'error_code', 'INVALID_JSON',
      'data', NULL
    );
    RETURN;
  END IF;

  -- Descomponer el JSON en un registro
  SELECT * INTO v_record
  FROM jsonb_populate_record(NULL::record, i_user_data) 
  AS (name TEXT, mail TEXT, password TEXT);

  -- Insertar el registro
  INSERT INTO elderly_user (name, mail, password, created_at)
  VALUES (
    TRIM(v_record.name),
    TRIM(v_record.mail),
    TRIM(v_record.password),
    CURRENT_TIMESTAMP
  )
  RETURNING id INTO v_inserted_id;

  -- Devolver resultado
  o_result := jsonb_build_object(
    'status', 'success',
    'data', jsonb_build_object(
      'id', v_inserted_id
    )
  );

EXCEPTION
  WHEN unique_violation THEN
    -- Error de correo duplicado
    o_result := jsonb_build_object(
      'status', 'error',
      'error_code', 'DUPLICATE_EMAIL',
      'data', NULL
    );
  WHEN OTHERS THEN
    -- Otros errores
    o_result := jsonb_build_object(
      'status', 'error',
      'error_code', 'UNKNOWN_ERROR',
	  'message', 'Error inesperado al registrar el usuario: ' || SQLERRM,
      'data', NULL
    );
END;
$$;


ALTER PROCEDURE public.register_elderly_user(IN i_user_data jsonb, OUT o_result jsonb) OWNER TO aplicaciones;

--
-- TOC entry 253 (class 1255 OID 158237)
-- Name: register_elderly_user_attributes(integer, jsonb); Type: PROCEDURE; Schema: public; Owner: aplicaciones
--

CREATE PROCEDURE public.register_elderly_user_attributes(IN i_user_id integer, IN i_attributes_json jsonb, OUT o_result jsonb)
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_item JSONB;
  v_attribute_id INTEGER;
  v_value TEXT;
  v_inserted_count INTEGER := 0;
BEGIN
  -- Validación del JSON de entrada
  IF i_attributes_json IS NULL OR jsonb_typeof(i_attributes_json) != 'array' THEN
    o_result := jsonb_build_object(
      'status', 'error',
      'error_code', 'INVALID_JSON',
      'data', NULL
    );
    RETURN;
  END IF;

  -- Iniciar transacción
  BEGIN
  
    -- Recorrer el arreglo JSON e insertar cada elemento
    FOR v_item IN SELECT * FROM jsonb_array_elements(i_attributes_json)
    LOOP
      v_attribute_id := (v_item ->> 'attributeId')::INTEGER;
      v_value := (v_item ->> 'value')::TEXT;

      IF v_attribute_id IS NULL OR v_value IS NULL THEN
        RAISE EXCEPTION 'Datos incompletos: %', v_item;
      END IF;

      INSERT INTO elderly_user_attribute (
        elderly_user_id,
        attribute_id,
        value,
        created_at
      ) VALUES (
        i_user_id,
        v_attribute_id,
        v_value,
        CURRENT_TIMESTAMP
      );

      v_inserted_count := v_inserted_count + 1;
    END LOOP;

    o_result := jsonb_build_object(
      'status', 'success',
      'message', 'Atributos registrados correctamente.',
      'data', jsonb_build_object(
        'user_id', i_user_id,
        'inserted_count', v_inserted_count
      )
    );

  EXCEPTION
    WHEN OTHERS THEN
      RAISE;
  END;

EXCEPTION
  WHEN OTHERS THEN
    o_result := jsonb_build_object(
      'status', 'error',
      'error_code', 'TRANSACTION_FAILED',
      'message', 'Error al registrar atributos: ' || SQLERRM,
      'data', NULL
    );
END;
$$;


ALTER PROCEDURE public.register_elderly_user_attributes(IN i_user_id integer, IN i_attributes_json jsonb, OUT o_result jsonb) OWNER TO aplicaciones;

--
-- TOC entry 259 (class 1255 OID 166433)
-- Name: update_elderly_user_attributes(integer, jsonb); Type: PROCEDURE; Schema: public; Owner: aplicaciones
--

CREATE PROCEDURE public.update_elderly_user_attributes(IN i_user_id integer, IN i_attributes_json jsonb, OUT o_result jsonb)
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_item JSONB;
  v_attribute_id INTEGER;
  v_value TEXT;
  v_updated_count INTEGER := 0;
  v_existing_record_id INTEGER;
  v_now TIMESTAMP := CURRENT_TIMESTAMP;
  v_error_message TEXT;
BEGIN
  IF i_attributes_json IS NULL OR jsonb_typeof(i_attributes_json) != 'array' THEN
    o_result := jsonb_build_object(
      'status', 'error',
      'error_code', 'INVALID_INPUT',
      'message', 'Los atributos deben ser un arreglo JSON',
      'data', NULL
    );
    RETURN;
  END IF;

  BEGIN
    FOR v_item IN SELECT * FROM jsonb_array_elements(i_attributes_json)
    LOOP
      BEGIN 
        v_attribute_id := (v_item->>'attributeId')::INTEGER;
        v_value := COALESCE(v_item->>'value', '');
        
        IF v_attribute_id IS NULL THEN
          RAISE EXCEPTION 'attributeId es requerido';
        END IF;

        -- Buscar registro existente
        SELECT id INTO v_existing_record_id
        FROM elderly_user_attribute
        WHERE elderly_user_id = i_user_id
          AND attribute_id = v_attribute_id
        LIMIT 1
        FOR UPDATE;

        IF v_existing_record_id IS NOT NULL THEN
          -- Actualizar registro existente
          UPDATE elderly_user_attribute
          SET 
            value = v_value,
            updated_at = v_now
          WHERE id = v_existing_record_id;
        ELSE
          -- Insertar nuevo registro
          INSERT INTO elderly_user_attribute (
            elderly_user_id,
            attribute_id,
            value,
            created_at,
            updated_at
          ) VALUES (
            i_user_id,
            v_attribute_id,
            v_value,
            v_now,
            v_now
          );
        END IF;

        v_updated_count := v_updated_count + 1;
      EXCEPTION WHEN OTHERS THEN
        v_error_message := SQLERRM;
        RAISE WARNING 'Error procesando atributo %: %', v_item, v_error_message;
      END;
    END LOOP;

    o_result := jsonb_build_object(
      'status', 'success',
      'message', 'Atributos actualizados correctamente',
      'data', jsonb_build_object(
        'user_id', i_user_id,
        'updated_count', v_updated_count,
        'timestamp', v_now
      )
    );
    
  EXCEPTION WHEN OTHERS THEN
    o_result := jsonb_build_object(
      'status', 'error',
      'error_code', CASE 
        WHEN SQLSTATE = '23505' THEN 'DUPLICATE_ATTRIBUTE'
        WHEN SQLSTATE = '23514' THEN 'CHECK_VIOLATION'
        ELSE 'UPDATE_FAILED'
      END,
      'message', 'Error al actualizar atributos: ' || SQLERRM,
      'sqlstate', SQLSTATE,
      'data', NULL
    );
  END;
END;
$$;


ALTER PROCEDURE public.update_elderly_user_attributes(IN i_user_id integer, IN i_attributes_json jsonb, OUT o_result jsonb) OWNER TO aplicaciones;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 237 (class 1259 OID 166471)
-- Name: actions; Type: TABLE; Schema: public; Owner: aplicaciones
--

CREATE TABLE public.actions (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    args text[] NOT NULL,
    body text NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone,
    is_async boolean
);


ALTER TABLE public.actions OWNER TO aplicaciones;

--
-- TOC entry 236 (class 1259 OID 166470)
-- Name: actions_id_seq; Type: SEQUENCE; Schema: public; Owner: aplicaciones
--

CREATE SEQUENCE public.actions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.actions_id_seq OWNER TO aplicaciones;

--
-- TOC entry 3501 (class 0 OID 0)
-- Dependencies: 236
-- Name: actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aplicaciones
--

ALTER SEQUENCE public.actions_id_seq OWNED BY public.actions.id;


--
-- TOC entry 214 (class 1259 OID 158238)
-- Name: class_model_attribute_id_seq; Type: SEQUENCE; Schema: public; Owner: aplicaciones
--

CREATE SEQUENCE public.class_model_attribute_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.class_model_attribute_id_seq OWNER TO aplicaciones;

--
-- TOC entry 215 (class 1259 OID 158239)
-- Name: class_model_attribute; Type: TABLE; Schema: public; Owner: aplicaciones
--

CREATE TABLE public.class_model_attribute (
    id integer DEFAULT nextval('public.class_model_attribute_id_seq'::regclass) NOT NULL,
    user_model_id integer NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone,
    translations jsonb
);


ALTER TABLE public.class_model_attribute OWNER TO aplicaciones;

--
-- TOC entry 216 (class 1259 OID 158245)
-- Name: data_acquisition_type_id_seq; Type: SEQUENCE; Schema: public; Owner: aplicaciones
--

CREATE SEQUENCE public.data_acquisition_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.data_acquisition_type_id_seq OWNER TO aplicaciones;

--
-- TOC entry 217 (class 1259 OID 158246)
-- Name: data_acquisition_type; Type: TABLE; Schema: public; Owner: aplicaciones
--

CREATE TABLE public.data_acquisition_type (
    id integer DEFAULT nextval('public.data_acquisition_type_id_seq'::regclass) NOT NULL,
    type character varying(100) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone
);


ALTER TABLE public.data_acquisition_type OWNER TO aplicaciones;

--
-- TOC entry 218 (class 1259 OID 158250)
-- Name: data_type_id_seq; Type: SEQUENCE; Schema: public; Owner: aplicaciones
--

CREATE SEQUENCE public.data_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.data_type_id_seq OWNER TO aplicaciones;

--
-- TOC entry 219 (class 1259 OID 158251)
-- Name: data_type; Type: TABLE; Schema: public; Owner: aplicaciones
--

CREATE TABLE public.data_type (
    id integer DEFAULT nextval('public.data_type_id_seq'::regclass) NOT NULL,
    type character varying(100) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone
);


ALTER TABLE public.data_type OWNER TO aplicaciones;

--
-- TOC entry 220 (class 1259 OID 158255)
-- Name: data_type_attribute_id_seq; Type: SEQUENCE; Schema: public; Owner: aplicaciones
--

CREATE SEQUENCE public.data_type_attribute_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.data_type_attribute_id_seq OWNER TO aplicaciones;

--
-- TOC entry 221 (class 1259 OID 158256)
-- Name: data_type_attribute; Type: TABLE; Schema: public; Owner: aplicaciones
--

CREATE TABLE public.data_type_attribute (
    id integer DEFAULT nextval('public.data_type_attribute_id_seq'::regclass) NOT NULL,
    data_type_id integer NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone
);


ALTER TABLE public.data_type_attribute OWNER TO aplicaciones;

--
-- TOC entry 222 (class 1259 OID 158260)
-- Name: elderly_user_id_seq; Type: SEQUENCE; Schema: public; Owner: aplicaciones
--

CREATE SEQUENCE public.elderly_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.elderly_user_id_seq OWNER TO aplicaciones;

--
-- TOC entry 223 (class 1259 OID 158261)
-- Name: elderly_user; Type: TABLE; Schema: public; Owner: aplicaciones
--

CREATE TABLE public.elderly_user (
    id integer DEFAULT nextval('public.elderly_user_id_seq'::regclass) NOT NULL,
    name character varying(255) NOT NULL,
    mail character varying(255) NOT NULL,
    password text NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone
);


ALTER TABLE public.elderly_user OWNER TO aplicaciones;

--
-- TOC entry 224 (class 1259 OID 158267)
-- Name: elderly_user_attribute_id_seq; Type: SEQUENCE; Schema: public; Owner: aplicaciones
--

CREATE SEQUENCE public.elderly_user_attribute_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.elderly_user_attribute_id_seq OWNER TO aplicaciones;

--
-- TOC entry 225 (class 1259 OID 158268)
-- Name: elderly_user_attribute; Type: TABLE; Schema: public; Owner: aplicaciones
--

CREATE TABLE public.elderly_user_attribute (
    id integer DEFAULT nextval('public.elderly_user_attribute_id_seq'::regclass) NOT NULL,
    elderly_user_id integer NOT NULL,
    attribute_id integer NOT NULL,
    value text NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone
);


ALTER TABLE public.elderly_user_attribute OWNER TO aplicaciones;

--
-- TOC entry 226 (class 1259 OID 158274)
-- Name: elderly_user_model_id_seq; Type: SEQUENCE; Schema: public; Owner: aplicaciones
--

CREATE SEQUENCE public.elderly_user_model_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.elderly_user_model_id_seq OWNER TO aplicaciones;

--
-- TOC entry 227 (class 1259 OID 158275)
-- Name: elderly_user_model; Type: TABLE; Schema: public; Owner: aplicaciones
--

CREATE TABLE public.elderly_user_model (
    id integer DEFAULT nextval('public.elderly_user_model_id_seq'::regclass) NOT NULL,
    name character varying(255) NOT NULL,
    version character varying(50) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone,
    title character varying(255)
);


ALTER TABLE public.elderly_user_model OWNER TO aplicaciones;

--
-- TOC entry 228 (class 1259 OID 158279)
-- Name: listed_data_id_seq; Type: SEQUENCE; Schema: public; Owner: aplicaciones
--

CREATE SEQUENCE public.listed_data_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.listed_data_id_seq OWNER TO aplicaciones;

--
-- TOC entry 229 (class 1259 OID 158280)
-- Name: listed_data; Type: TABLE; Schema: public; Owner: aplicaciones
--

CREATE TABLE public.listed_data (
    id integer DEFAULT nextval('public.listed_data_id_seq'::regclass) NOT NULL,
    data_type_attribute_id integer NOT NULL,
    data character varying(255) NOT NULL,
    numerical_equivalent numeric NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone,
    translations jsonb,
    "position" integer,
    text_equivalent character varying(100)
);


ALTER TABLE public.listed_data OWNER TO aplicaciones;

--
-- TOC entry 239 (class 1259 OID 167017)
-- Name: metrics; Type: TABLE; Schema: public; Owner: aplicaciones
--

CREATE TABLE public.metrics (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    weight double precision NOT NULL,
    action character varying(200) NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone
);


ALTER TABLE public.metrics OWNER TO aplicaciones;

--
-- TOC entry 238 (class 1259 OID 167016)
-- Name: metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: aplicaciones
--

CREATE SEQUENCE public.metrics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.metrics_id_seq OWNER TO aplicaciones;

--
-- TOC entry 3502 (class 0 OID 0)
-- Dependencies: 238
-- Name: metrics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aplicaciones
--

ALTER SEQUENCE public.metrics_id_seq OWNED BY public.metrics.id;


--
-- TOC entry 230 (class 1259 OID 158286)
-- Name: model_attribute_id_seq; Type: SEQUENCE; Schema: public; Owner: aplicaciones
--

CREATE SEQUENCE public.model_attribute_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.model_attribute_id_seq OWNER TO aplicaciones;

--
-- TOC entry 231 (class 1259 OID 158287)
-- Name: model_attribute; Type: TABLE; Schema: public; Owner: aplicaciones
--

CREATE TABLE public.model_attribute (
    id integer DEFAULT nextval('public.model_attribute_id_seq'::regclass) NOT NULL,
    class_attribute_id integer NOT NULL,
    data_acquisition_type_id integer NOT NULL,
    data_type_attribute_id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(100) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone,
    is_default boolean,
    "position" integer,
    translations jsonb
);


ALTER TABLE public.model_attribute OWNER TO aplicaciones;

--
-- TOC entry 233 (class 1259 OID 166428)
-- Name: o_result; Type: TABLE; Schema: public; Owner: aplicaciones
--

CREATE TABLE public.o_result (
    json_agg json
);


ALTER TABLE public.o_result OWNER TO aplicaciones;

--
-- TOC entry 235 (class 1259 OID 166444)
-- Name: rules; Type: TABLE; Schema: public; Owner: aplicaciones
--

CREATE TABLE public.rules (
    id integer NOT NULL,
    name text NOT NULL,
    event text NOT NULL,
    condition text NOT NULL,
    actions text[] NOT NULL,
    priority integer NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone,
    translations jsonb,
    rollback_actions text[]
);


ALTER TABLE public.rules OWNER TO aplicaciones;

--
-- TOC entry 234 (class 1259 OID 166443)
-- Name: rules_id_seq; Type: SEQUENCE; Schema: public; Owner: aplicaciones
--

CREATE SEQUENCE public.rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rules_id_seq OWNER TO aplicaciones;

--
-- TOC entry 3503 (class 0 OID 0)
-- Dependencies: 234
-- Name: rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aplicaciones
--

ALTER SEQUENCE public.rules_id_seq OWNED BY public.rules.id;


--
-- TOC entry 232 (class 1259 OID 158293)
-- Name: v_record; Type: TABLE; Schema: public; Owner: aplicaciones
--

CREATE TABLE public.v_record (
    name text,
    mail text,
    code_mail text
);


ALTER TABLE public.v_record OWNER TO aplicaciones;

--
-- TOC entry 3282 (class 2604 OID 166474)
-- Name: actions id; Type: DEFAULT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.actions ALTER COLUMN id SET DEFAULT nextval('public.actions_id_seq'::regclass);


--
-- TOC entry 3283 (class 2604 OID 167020)
-- Name: metrics id; Type: DEFAULT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.metrics ALTER COLUMN id SET DEFAULT nextval('public.metrics_id_seq'::regclass);


--
-- TOC entry 3281 (class 2604 OID 166447)
-- Name: rules id; Type: DEFAULT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.rules ALTER COLUMN id SET DEFAULT nextval('public.rules_id_seq'::regclass);


--
-- TOC entry 3492 (class 0 OID 166471)
-- Dependencies: 237
-- Data for Name: actions; Type: TABLE DATA; Schema: public; Owner: aplicaciones
--

INSERT INTO public.actions (id, name, args, body, created_at, updated_at, deleted_at, is_async) VALUES (2, 'countSyllables', '{text}', '

console.log(text);
let words = text.split(/\s+/);
console.log("split", words);
let count = 0;
words.forEach(word => {
    let vowelMatches = word.match(/[aeiouáéíóúü]{1,2}/);
	let vowelCount = vowelMatches != null ? vowelMatches.length : 1;
	console.log(vowelCount, count);
    count = count + vowelCount;
});
return count;
', '2025-08-11 22:02:58.861992', NULL, NULL, false);
INSERT INTO public.actions (id, name, args, body, created_at, updated_at, deleted_at, is_async) VALUES (5, 'calculatePageTextDensity', '{}', 'let html = document.documentElement.outerHTML;
    let totalBlobSize = getBlobSize(html);
    let visibleText = document.body.textContent.replace(/\s+/g, " ").trim();
    let textBlobSize = getBlobSize(visibleText);
    let density = textBlobSize / totalBlobSize;
	return density', '2025-08-12 18:00:23.399804', NULL, NULL, false);
INSERT INTO public.actions (id, name, args, body, created_at, updated_at, deleted_at, is_async) VALUES (4, 'evaluatePageLegibility', '{}', '
let elements = document.querySelectorAll("*");
    let width = document.documentElement.scrollWidth;
    let height = document.documentElement.scrollHeight;

    let half_width = width / 2;
    let half_height = height / 2;

    let total_area = 0;
    let left_area = 0;
    let right_area = 0;
    let top_area = 0;
    let bottom_area = 0;

    for (let element of elements) {
        let rect = element.getBoundingClientRect();
        if (rect.width == 0 || rect.height == 0 || rect.top < 0 || rect.left < 0) {
            continue;
        }
        
        let area = rect.width * rect.height;
        total_area = total_area + area;
        
        let overlap_left = Math.max(0, Math.min(rect.right, half_width) - rect.left);
        let overlap_right = Math.max(0, Math.min(rect.right, width) - Math.max(rect.left, half_width));        
        let overlap_top = Math.max(0, Math.min(rect.bottom, half_height) - rect.top);
        let overlap_bottom = Math.max(0, Math.min(rect.bottom, height) - Math.max(rect.top, half_height));        
        left_area += area * (overlap_left / rect.width);
        right_area += area * (overlap_right / rect.width);
        top_area += area * (overlap_top / rect.height);
        bottom_area += area * (overlap_bottom / rect.height);
    };
	if (total_area <= 0) return 0;
    let horizontal_balance = Math.abs(left_area - right_area) / total_area;
    let vertical_balance = Math.abs(top_area - bottom_area) / total_area;
    let balance = (horizontal_balance + vertical_balance) / 2;
    return balance;
', '2025-08-12 10:05:33.079428', NULL, NULL, false);
INSERT INTO public.actions (id, name, args, body, created_at, updated_at, deleted_at, is_async) VALUES (11, 'evaluatePageColourfulness', '{pageScreenshot}', 'return new Promise(function(resolve) {
	            let canvas = document.createElement("canvas");
	            let ctx = canvas.getContext("2d");
	            let img = new Image();
	    
	            createImg(pageScreenshot, function(img) {
	                ctx.drawImage(img, 0, 0, img.width, img.height);
	
	                let colorfulness = evaluateCanvasColourfulness(canvas);
	                resolve(colorfulness);
	            });
	        });', '2025-08-18 01:45:07.275895', NULL, NULL, true);
INSERT INTO public.actions (id, name, args, body, created_at, updated_at, deleted_at, is_async) VALUES (1, 'changeFont', '{fontSize,measure}', 'let size = fontSize + measure;
setStyle("*:not(.accessibility-panel):not(accessibility-panel *)", {"font-size": size + "!important"});', '2025-08-05 08:31:03.656165', NULL, NULL, false);
INSERT INTO public.actions (id, name, args, body, created_at, updated_at, deleted_at, is_async) VALUES (7, 'evaluatePageSymmetry', '{}', '
		let X = [[0, 0], [0, 0]];
        let Y = [[0, 0], [0, 0]];
        let B = [[0, 0], [0, 0]];
        let H = [[0, 0], [0, 0]];
        let T = [[0, 0], [0, 0]];
        let R = [[0, 0], [0, 0]];
        let frameWidth = window.innerWidth;
        let frameHeight = window.innerHeight;
        let frameCenterX = frameWidth / 2;
        let frameCenterY = frameHeight / 2;
        let elements = Array.from(document.body.getElementsByTagName("*"));
        let regions = elements.map(el => {
            let rect = el.getBoundingClientRect();
            return {
                left: rect.left,
                right: rect.right,
                top: rect.top,
                bottom: rect.bottom,
                width: rect.width,
                height: rect.height,
                centerX: rect.left + rect.width / 2,
                centerY: rect.top + rect.height / 2
            };
        });
        regions.forEach(r => {
            let proportions = [[0, 0], [0, 0]];
            let totalArea = r.width * r.height || 1;
            proportions[0][0] = Math.max(0, Math.min(frameCenterX, r.right) - Math.max(0, r.left)) * Math.max(0, Math.min(frameCenterY, r.bottom) - Math.max(0, r.top)) / totalArea;
            proportions[0][1] = Math.max(0, Math.min(frameCenterX, r.right) - Math.max(0, r.left)) * Math.max(0, r.bottom - frameCenterY) / totalArea;
            proportions[1][0] = Math.max(0, r.right - frameCenterX) * Math.max(0, Math.min(frameCenterY, r.bottom) - Math.max(0, r.top)) / totalArea;
            proportions[1][1] = Math.max(0, r.right - frameCenterX) * Math.max(0, r.bottom - frameCenterY) / totalArea;
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j = j + 1) {
                    let proportion = proportions[i][j];
                    X[i][j] += proportion * Math.abs(r.centerX - frameCenterX);
                    Y[i][j] += proportion * Math.abs(r.centerY - frameCenterY);
                    B[i][j] += proportion * r.width;
                    H[i][j] += proportion * r.height;
                    R[i][j] += proportion * Math.sqrt(Math.pow(r.centerX - frameCenterX, 2) + Math.pow(r.centerY - frameCenterY, 2));                    
                    if (r.centerX != frameCenterX || r.centerY != frameCenterY) {
                        T[i][j] += proportion * (Math.abs(r.centerY - frameCenterY) + Math.abs(r.centerX - frameCenterX));
                    }
                }
            }
        });
        let SymmetryV = 0;
        let SymmetryH = 0;
        let SymmetryR = 0;
        for (let M of [X, Y, B, H, T, R]) {
            M = normalizeMatrix(M);
            SymmetryV += (Math.abs(M[0][0] - M[1][0]) + Math.abs(M[0][1] - M[1][1])) / 12;
            SymmetryH += (Math.abs(M[0][0] - M[0][1]) + Math.abs(M[1][0] - M[1][1])) / 12;
            SymmetryR += (Math.abs(M[0][0] - M[1][1]) + Math.abs(M[1][0] - M[0][1])) / 12;
        };
        let symmetry = (SymmetryV + SymmetryH + SymmetryR) / 3;
        console.log("simetria", symmetry);
       	return symmetry;
	', '2025-08-13 13:43:50.858912', NULL, NULL, false);
INSERT INTO public.actions (id, name, args, body, created_at, updated_at, deleted_at, is_async) VALUES (3, 'calculateReadability', '{text}', '
let words = text.split(/\s+/).length;
	console.log("splitting", text, text.split(/[.!?]+/));
	let sentences = text.split(/[.!?]+/).length;
	let syllables = countSyllables(text);
	let fleschIndex = 206.835 - (1.015 * words / sentences) - (84.6 * (syllables / words));
	console.log("indice en calcular individual ", fleschIndex);
	return fleschIndex;
', '2025-08-12 09:50:30.87378', NULL, NULL, false);
INSERT INTO public.actions (id, name, args, body, created_at, updated_at, deleted_at, is_async) VALUES (6, 'evaluatePageBalance', '{}', '
let elements = document.querySelectorAll("*");
    let width = document.documentElement.scrollWidth;
    let height = document.documentElement.scrollHeight;
    let half_width = width / 2;
    let half_height = height / 2;
    let total_area = 0;
    let left_area = 0;
    let right_area = 0;
    let top_area = 0;
    let bottom_area = 0;

    for (let element of elements) {
        let rect = element.getBoundingClientRect();
        if (rect.width == 0 || rect.height == 0 || rect.top < 0 || rect.left < 0) {
            continue;
        }
        
        let area = rect.width * rect.height;
        total_area = total_area + area;
        
        let overlap_left = Math.max(0, Math.min(rect.right, half_width) - rect.left);
        let overlap_right = Math.max(0, Math.min(rect.right, width) - Math.max(rect.left, half_width));        
        let overlap_top = Math.max(0, Math.min(rect.bottom, half_height) - rect.top);
        let overlap_bottom = Math.max(0, Math.min(rect.bottom, height) - Math.max(rect.top, half_height));        
        left_area += area * (overlap_left / rect.width);
        right_area += area * (overlap_right / rect.width);
        top_area += area * (overlap_top / rect.height);
        bottom_area += area * (overlap_bottom / rect.height);
    };
	if (total_area <= 0) return 0;
    let horizontal_balance = Math.abs(left_area - right_area) / total_area;
    let vertical_balance = Math.abs(top_area - bottom_area) / total_area;
    let balance = (horizontal_balance + vertical_balance) / total_area;
    return balance;
', '2025-08-13 09:40:39.501154', NULL, NULL, false);
INSERT INTO public.actions (id, name, args, body, created_at, updated_at, deleted_at, is_async) VALUES (8, 'evaluatePageProportion', '{}', 'let width = Math.max(
    document.documentElement.scrollWidth, 
    document.body.scrollWidth,
    document.documentElement.clientWidth
);
let height = Math.max(
    document.documentElement.scrollHeight, 
    document.body.scrollHeight,
    document.documentElement.clientHeight
);
let aesthetic_ratios = [0.5, 0.618, 0.707, 0.577, 1];
let elements = document.querySelectorAll("*");
let total_object_diff = 0;
let total_elements = 0;
for (let element of elements) {
    let rect = element.getBoundingClientRect();
    if (rect.top < 0 || rect.left < 0 || rect.bottom > height || rect.right > width || rect.width <= 0 || rect.height <= 0) {
        continue;
    }
    let object_proportion = Math.min(rect.width, rect.height) / Math.max(rect.width, rect.height);
    let minDiff = Infinity;
    for (let ratio of aesthetic_ratios) {
        let diff = Math.abs(object_proportion - ratio);
        if (diff < minDiff) {
            minDiff = diff;
        }
    }
    let object_diff = (1 - 2 * minDiff);
    total_object_diff += object_diff;
    total_elements++;
}
let total_proportion = 0;
if (total_elements != 0) {
    let avarage_diff = total_object_diff / total_elements;
    let layout_proportion = Math.min(width, height) / Math.max(width, height);
    let minDiff = Infinity;
    for (let ratio of aesthetic_ratios) {
        let diff = Math.abs(layout_proportion - ratio);
        if (diff < minDiff) {
            minDiff = diff;
        }
    }
    let layout_diff = (1 - 2 * minDiff);
    total_proportion = (avarage_diff + layout_diff) / 2;
}
console.log("Proportion = ", total_proportion);
return total_proportion;', '2025-08-13 19:48:43.241571', NULL, NULL, false);
INSERT INTO public.actions (id, name, args, body, created_at, updated_at, deleted_at, is_async) VALUES (9, 'evaluatePageEquilibrium', '{}', '
let elements = document.querySelectorAll("*");
        let width = document.documentElement.scrollWidth;
        let height = document.documentElement.scrollHeight;
        let total_area = 0;
        let total_centroid_x = 0; 
        let total_centroid_y =  0;
        for (let element of elements) {
            let rect = element.getBoundingClientRect();
            if (rect.width == 0 || rect.height == 0 || rect.top < 0 || rect.left < 0) {
                continue;
            }
            let area = rect.width * rect.height;
            total_area += area;
            let centroid_x = rect.left + rect.width / 2;
            let centroid_y = rect.top + rect.height / 2;
            total_centroid_x += centroid_x * area;
            total_centroid_y += centroid_y * area;
        }
		if (total_area <= 0) return 0;
        let balance_centroid_x = total_centroid_x / total_area;
        let balance_centroid_y = total_centroid_y / total_area;
        let center_x = width / 2;
        let center_y = height / 2;
        let distance_x = Math.abs(balance_centroid_x - center_x);
        let distance_y = Math.abs(balance_centroid_y - center_y);
        let overall_balance = (distance_x + distance_y) / (width + height);
        console.log("Equilibrio total:",  overall_balance.toFixed(4));
        return overall_balance;
', '2025-08-13 19:56:44.821411', NULL, NULL, false);
INSERT INTO public.actions (id, name, args, body, created_at, updated_at, deleted_at, is_async) VALUES (16, 'calculatePageContrast', '{pageScreenshot}', 'return new Promise(function(resolve) {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    let img = new Image();
    
    createImg(pageScreenshot, function(img) {
        let width = window.innerWidth;
        let height = window.innerHeight;
        
        canvas.width = width;
        canvas.height = height;
        
        let scaleRatio = Math.min(
            width / img.width,
            height / img.height
        );
        
        ctx.drawImage(
            img,
            0, 0, img.width, img.height,
            0, 0, img.width * scaleRatio, img.height * scaleRatio
        );

        let elements = Array.from(document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, a, button, label")).filter(el => {
            let rect = el.getBoundingClientRect();
            return (
                rect.width > 0 &&
                rect.height > 0 &&
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= height &&
                rect.right <= width &&
                el.innerText.trim().length > 0
            );
        });

        let validElements = 0;
        let totalElements = 0;

        if (elements.length == 0) {
            resolve(1);
            return;
        }

        for (let element of elements) {
            let elementRect = element.getBoundingClientRect();
            totalElements++;

            let style = window.getComputedStyle(element);
            let textColor = rgbToArray(style.color);
            let isLarge = isLargeText(style);

            let bgColor = getAvarageCanvasSegmentColor(ctx, elementRect);
            let contrast = calculateColorContrastRatio(textColor, bgColor);

            if (contrast >= 21) {
                validElements++;
                continue;
            }
            
            if (isLarge && contrast >= 3 || !isLarge && contrast >= 4.5) {
                validElements++;
            }
        }

        let pageContrast = validElements/totalElements;
        console.log("Contraste promedio = ", validElements, totalElements, pageContrast);
        resolve(pageContrast);
    });
});', '2025-08-19 16:24:31.65619', NULL, NULL, true);
INSERT INTO public.actions (id, name, args, body, created_at, updated_at, deleted_at, is_async) VALUES (10, 'evaluateCanvasColourfulness', '{canvas}', '
		let img = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
        let pixels = Array.from(img.data);

        let p = pixels.length / 4;

        let rg = [];
        let yb = [];

        for (let i = 0; i < pixels.length; i += 4) {
            let r = pixels[i];
            let g = pixels[i + 1];
            let b = pixels[i + 2];
                            
            rg.push(Math.abs(r - g));
            yb.push(Math.abs((r + g) / 2 - b));        
        }

        let mean_rg = mean(rg, p);
        let mean_yb = mean(yb, p);
        let variance_rg = variance(rg, mean_rg, p - 1);
        let variance_yb = variance(yb, mean_yb, p - 1);
        let sigma_rg = Math.sqrt(variance_rg);
        let sigma_yb = Math.sqrt(variance_yb);
        let sigma_rgyb = Math.sqrt(sigma_rg * sigma_rg + sigma_yb * sigma_yb);
        let mu_rgyb = Math.sqrt(mean_rg * mean_rg + mean_yb * mean_yb);
        let colourfulness = (sigma_rgyb + 0.3 * mu_rgyb) / 255;

        console.log("coloridad", colourfulness);
        return colourfulness;
	', '2025-08-18 01:43:28.451817', NULL, NULL, false);
INSERT INTO public.actions (id, name, args, body, created_at, updated_at, deleted_at, is_async) VALUES (12, 'isLargeText', '{element}', 'let fontSize = parseInt(element.fontSize, 10);
    let isBold = element.fontWeight == "bold";
    return (fontSize >= 18 || (fontSize >= 14 && isBold));', '2025-08-19 15:56:13.477094', NULL, NULL, false);
INSERT INTO public.actions (id, name, args, body, created_at, updated_at, deleted_at, is_async) VALUES (13, 'calculateLuminescence', '{r,g,b}', 'let sRGB = 0.04045;
	r /= 255;
    g /= 255;
    b /= 255;
	if (r <= sRGB) r = (r <= sRGB) ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    if (g <= sRGB) g = (g <= sRGB) ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    if (b <= sRGB) b = (b <= sRGB) ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;', '2025-08-19 16:10:28.631765', NULL, NULL, false);
INSERT INTO public.actions (id, name, args, body, created_at, updated_at, deleted_at, is_async) VALUES (14, 'calculateColorContrastRatio', '{colorA,colorB}', 'let rA = colorA[0];
    let gA = colorA[1];
    let bA = colorA[2];

    let rB = colorB[0];
    let gB = colorB[1];
    let bB = colorB[2];

    let L1 = calculateLuminescence(rA, gA, bA);
    let L2 = calculateLuminescence(rB, gB, bB);
    
    let lighter = Math.max(L1, L2);
    let darker = Math.min(L1, L2);

    return (lighter + 0.05) / (darker + 0.05);', '2025-08-19 16:20:27.234974', NULL, NULL, false);
INSERT INTO public.actions (id, name, args, body, created_at, updated_at, deleted_at, is_async) VALUES (15, 'getAvarageCanvasSegmentColor', '{canvasContext,elementRect}', 'let imgData = canvasContext.getImageData(elementRect.left, elementRect.top, elementRect.width, elementRect.height);
    let pixels = Array.from(imgData.data);
    let r = 0;
    let g = 0;
    let b = 0;
    let pixelCount = 0;
    for (let i = 0; i < pixels.length; i += 4) {
        r += pixels[i];
        g += pixels[i + 1];
        b += pixels[i + 2];
		pixelCount++;
    }    
    return [r / pixelCount, g / pixelCount, b / pixelCount];', '2025-08-19 16:22:33.947911', NULL, NULL, false);
INSERT INTO public.actions (id, name, args, body, created_at, updated_at, deleted_at, is_async) VALUES (17, 'changeFontFamily', '{font}', 'tracker.set("*:not(i):not(span):not(.fa):not(.fas)", {
        "font-family": font + "!important"
    });', '2025-08-21 07:06:06.645401', NULL, NULL, false);


--
-- TOC entry 3470 (class 0 OID 158239)
-- Dependencies: 215
-- Data for Name: class_model_attribute; Type: TABLE DATA; Schema: public; Owner: aplicaciones
--

INSERT INTO public.class_model_attribute (id, user_model_id, name, created_at, updated_at, deleted_at, translations) VALUES (1, 1, 'Demographic data', '2025-07-13 00:00:00', NULL, NULL, '{"ar": "البيانات الديموغرافية", "de": "Demografische Daten", "en": "Demographic data", "es": "Datos demográficos", "fr": "Données démographiques", "hi": "जनसांख्यिकीय डेटा", "ja": "人口統計データ", "pt": "Dados demográficos", "ru": "Демографические данные", "zh": "人口统计数据"}');
INSERT INTO public.class_model_attribute (id, user_model_id, name, created_at, updated_at, deleted_at, translations) VALUES (2, 1, 'Physical capacities', '2025-07-13 00:00:00', NULL, NULL, '{"ar": "القدرات البدنية", "de": "Physische Fähigkeiten", "en": "Physical capacities", "es": "Capacidades físicas", "fr": "Capacités physiques", "hi": "शारीरिक क्षमताएँ", "ja": "身体的容量", "pt": "Capacidades físicas", "ru": "Физические способности", "zh": "身体能力"}');
INSERT INTO public.class_model_attribute (id, user_model_id, name, created_at, updated_at, deleted_at, translations) VALUES (3, 1, 'Cognitive capacities', '2025-07-13 00:00:00', NULL, NULL, '{"ar": "القدرات المعرفية", "de": "Kognitive Fähigkeiten", "en": "Cognitive capacities", "es": "Capacidades cognitivas", "fr": "Capacités cognitives", "hi": "संज्ञानात्मक क्षमताएँ", "ja": "認知能力", "pt": "Capacidades cognitivas", "ru": "Когнитивные способности", "zh": "认知能力"}');
INSERT INTO public.class_model_attribute (id, user_model_id, name, created_at, updated_at, deleted_at, translations) VALUES (4, 1, 'Tecnhology usage skills', '2025-07-13 00:00:00', NULL, NULL, '{"ar": "مهارات استخدام التكنولوجيا", "de": "Fähigkeiten im Technologieeinsatz", "en": "Technology usage skills", "es": "Habilidades tecnológicas", "fr": "Compétences en utilisation de la technologie", "hi": "प्रौद्योगिकी उपयोग कौशल", "ja": "技術使用スキル", "pt": "Habilidades de uso de tecnologia", "ru": "Навыки использования технологий", "zh": "技术使用技能"}');
INSERT INTO public.class_model_attribute (id, user_model_id, name, created_at, updated_at, deleted_at, translations) VALUES (5, 1, 'User preferences', '2025-07-13 00:00:00', NULL, NULL, '{"ar": "تفضيلات المستخدم", "de": "Benutzerpräferenzen", "en": "User preferences", "es": "Preferencias del usuario", "fr": "Préférences de l''utilisateur", "hi": "उपयोगकर्ता प्राथमिकताएँ", "ja": "ユーザーの好み", "pt": "Preferências do usuário", "ru": "Предпочтения пользователя", "zh": "用户偏好"}');


--
-- TOC entry 3472 (class 0 OID 158246)
-- Dependencies: 217
-- Data for Name: data_acquisition_type; Type: TABLE DATA; Schema: public; Owner: aplicaciones
--

INSERT INTO public.data_acquisition_type (id, type, created_at, updated_at, deleted_at) VALUES (1, 'Explicit', '2025-07-13 00:00:00', NULL, NULL);
INSERT INTO public.data_acquisition_type (id, type, created_at, updated_at, deleted_at) VALUES (2, 'Implicit', '2025-07-13 00:00:00', NULL, NULL);


--
-- TOC entry 3474 (class 0 OID 158251)
-- Dependencies: 219
-- Data for Name: data_type; Type: TABLE DATA; Schema: public; Owner: aplicaciones
--

INSERT INTO public.data_type (id, type, created_at, updated_at, deleted_at) VALUES (1, 'Basic', '2025-07-13 00:00:00', NULL, NULL);
INSERT INTO public.data_type (id, type, created_at, updated_at, deleted_at) VALUES (2, 'Listed', '2025-07-13 00:00:00', NULL, NULL);
INSERT INTO public.data_type (id, type, created_at, updated_at, deleted_at) VALUES (3, 'Personalized', '2025-08-21 12:44:00.348926', NULL, NULL);


--
-- TOC entry 3476 (class 0 OID 158256)
-- Dependencies: 221
-- Data for Name: data_type_attribute; Type: TABLE DATA; Schema: public; Owner: aplicaciones
--

INSERT INTO public.data_type_attribute (id, data_type_id, name, created_at, updated_at, deleted_at) VALUES (1, 1, 'int', '2025-07-13 00:00:00', NULL, NULL);
INSERT INTO public.data_type_attribute (id, data_type_id, name, created_at, updated_at, deleted_at) VALUES (2, 1, 'float', '2025-07-13 00:00:00', NULL, NULL);
INSERT INTO public.data_type_attribute (id, data_type_id, name, created_at, updated_at, deleted_at) VALUES (3, 1, 'string', '2025-07-13 00:00:00', NULL, NULL);
INSERT INTO public.data_type_attribute (id, data_type_id, name, created_at, updated_at, deleted_at) VALUES (4, 1, 'date', '2025-07-13 00:00:00', NULL, NULL);
INSERT INTO public.data_type_attribute (id, data_type_id, name, created_at, updated_at, deleted_at) VALUES (5, 2, 'genderType', '2025-07-13 00:00:00', NULL, NULL);
INSERT INTO public.data_type_attribute (id, data_type_id, name, created_at, updated_at, deleted_at) VALUES (6, 2, 'contrastLevel', '2025-07-13 00:00:00', NULL, NULL);
INSERT INTO public.data_type_attribute (id, data_type_id, name, created_at, updated_at, deleted_at) VALUES (7, 2, 'educationLevel', '2025-07-13 00:00:00', NULL, NULL);
INSERT INTO public.data_type_attribute (id, data_type_id, name, created_at, updated_at, deleted_at) VALUES (8, 2, 'liker5', '2025-07-13 00:00:00', NULL, NULL);
INSERT INTO public.data_type_attribute (id, data_type_id, name, created_at, updated_at, deleted_at) VALUES (9, 2, 'liker4', '2025-07-13 00:00:00', NULL, NULL);
INSERT INTO public.data_type_attribute (id, data_type_id, name, created_at, updated_at, deleted_at) VALUES (10, 2, 'educationLevel', '2025-07-13 00:00:00', NULL, NULL);
INSERT INTO public.data_type_attribute (id, data_type_id, name, created_at, updated_at, deleted_at) VALUES (11, 2, 'contrastLevel', '2025-07-13 00:00:00', NULL, NULL);
INSERT INTO public.data_type_attribute (id, data_type_id, name, created_at, updated_at, deleted_at) VALUES (12, 2, 'liker3', '2025-07-13 00:00:00', NULL, NULL);
INSERT INTO public.data_type_attribute (id, data_type_id, name, created_at, updated_at, deleted_at) VALUES (13, 2, 'preferredLanguage', '2025-07-13 00:00:00', NULL, NULL);
INSERT INTO public.data_type_attribute (id, data_type_id, name, created_at, updated_at, deleted_at) VALUES (14, 3, 'password', '2025-08-21 12:44:26.07206', NULL, NULL);
INSERT INTO public.data_type_attribute (id, data_type_id, name, created_at, updated_at, deleted_at) VALUES (15, 1, 'password', '2025-08-23 09:55:26.478374', NULL, NULL);


--
-- TOC entry 3478 (class 0 OID 158261)
-- Dependencies: 223
-- Data for Name: elderly_user; Type: TABLE DATA; Schema: public; Owner: aplicaciones
--

INSERT INTO public.elderly_user (id, name, mail, password, created_at, updated_at, deleted_at) VALUES (93, 'A', 'a@gmail.com', 'Hcasano2350702268', '2025-08-27 04:02:52.807711', NULL, NULL);
INSERT INTO public.elderly_user (id, name, mail, password, created_at, updated_at, deleted_at) VALUES (94, 'ASD', 'asd@gmail.com', 'Hcasano2350702268', '2025-08-27 04:12:03.014603', NULL, NULL);
INSERT INTO public.elderly_user (id, name, mail, password, created_at, updated_at, deleted_at) VALUES (95, 'J', 'J@gmail.com', 'Hcasano2350702268', '2025-08-27 04:13:43.309715', NULL, NULL);


--
-- TOC entry 3480 (class 0 OID 158268)
-- Dependencies: 225
-- Data for Name: elderly_user_attribute; Type: TABLE DATA; Schema: public; Owner: aplicaciones
--

INSERT INTO public.elderly_user_attribute (id, elderly_user_id, attribute_id, value, created_at, updated_at, deleted_at) VALUES (398, 95, 14, 'J', '2025-08-27 04:13:43.388513', '2025-08-27 04:15:49.604024', NULL);
INSERT INTO public.elderly_user_attribute (id, elderly_user_id, attribute_id, value, created_at, updated_at, deleted_at) VALUES (399, 95, 17, 'J', '2025-08-27 04:13:43.388513', '2025-08-27 04:15:49.604024', NULL);
INSERT INTO public.elderly_user_attribute (id, elderly_user_id, attribute_id, value, created_at, updated_at, deleted_at) VALUES (400, 95, 18, 'en', '2025-08-27 04:13:43.388513', '2025-08-27 04:15:49.604024', NULL);
INSERT INTO public.elderly_user_attribute (id, elderly_user_id, attribute_id, value, created_at, updated_at, deleted_at) VALUES (401, 95, 27, 'J@gmail.com', '2025-08-27 04:13:43.388513', '2025-08-27 04:15:49.604024', NULL);
INSERT INTO public.elderly_user_attribute (id, elderly_user_id, attribute_id, value, created_at, updated_at, deleted_at) VALUES (402, 95, 28, 'Hcasano2350702268', '2025-08-27 04:13:43.388513', '2025-08-27 04:15:49.604024', NULL);
INSERT INTO public.elderly_user_attribute (id, elderly_user_id, attribute_id, value, created_at, updated_at, deleted_at) VALUES (403, 95, 20, 'Low', '2025-08-27 04:13:43.388513', '2025-08-27 04:15:49.604024', NULL);
INSERT INTO public.elderly_user_attribute (id, elderly_user_id, attribute_id, value, created_at, updated_at, deleted_at) VALUES (404, 95, 19, 'Medium', '2025-08-27 04:13:43.388513', '2025-08-27 04:15:49.604024', NULL);
INSERT INTO public.elderly_user_attribute (id, elderly_user_id, attribute_id, value, created_at, updated_at, deleted_at) VALUES (405, 95, 23, 'Low', '2025-08-27 04:13:43.388513', '2025-08-27 04:15:49.604024', NULL);
INSERT INTO public.elderly_user_attribute (id, elderly_user_id, attribute_id, value, created_at, updated_at, deleted_at) VALUES (406, 95, 22, 'Preschool', '2025-08-27 04:13:43.388513', '2025-08-27 04:15:49.604024', NULL);
INSERT INTO public.elderly_user_attribute (id, elderly_user_id, attribute_id, value, created_at, updated_at, deleted_at) VALUES (407, 95, 26, 'High', '2025-08-27 04:13:43.388513', '2025-08-27 04:15:49.604024', NULL);
INSERT INTO public.elderly_user_attribute (id, elderly_user_id, attribute_id, value, created_at, updated_at, deleted_at) VALUES (408, 95, 25, 'Medium', '2025-08-27 04:13:43.388513', '2025-08-27 04:15:49.604024', NULL);
INSERT INTO public.elderly_user_attribute (id, elderly_user_id, attribute_id, value, created_at, updated_at, deleted_at) VALUES (409, 95, 24, 'Medium', '2025-08-27 04:13:43.388513', '2025-08-27 04:15:49.604024', NULL);


--
-- TOC entry 3482 (class 0 OID 158275)
-- Dependencies: 227
-- Data for Name: elderly_user_model; Type: TABLE DATA; Schema: public; Owner: aplicaciones
--

INSERT INTO public.elderly_user_model (id, name, version, created_at, updated_at, deleted_at, title) VALUES (1, 'Elderly model', 'v1.0', '2025-07-13 00:00:00', NULL, NULL, 'Perfil de usuario');


--
-- TOC entry 3484 (class 0 OID 158280)
-- Dependencies: 229
-- Data for Name: listed_data; Type: TABLE DATA; Schema: public; Owner: aplicaciones
--

INSERT INTO public.listed_data (id, data_type_attribute_id, data, numerical_equivalent, created_at, updated_at, deleted_at, translations, "position", text_equivalent) VALUES (4, 13, 'English', 2, '2025-07-13 00:00:00', NULL, NULL, '{"ar": "الإنجليزية", "de": "Englisch", "en": "English", "es": "Inglés", "fr": "Anglais", "hi": "अंग्रेजी", "ja": "英語", "pt": "Inglês", "ru": "Английский", "zh": "英语"}', 1, 'en');
INSERT INTO public.listed_data (id, data_type_attribute_id, data, numerical_equivalent, created_at, updated_at, deleted_at, translations, "position", text_equivalent) VALUES (5, 12, 'Low', 1, '2025-07-13 00:00:00', NULL, NULL, '{"ar": "منخفض", "de": "Niedrig", "en": "Low", "es": "Bajo", "fr": "Bas", "hi": "निम्न", "ja": "低い", "pt": "Baixo", "ru": "Низкий", "zh": "低"}', 1, 'low');
INSERT INTO public.listed_data (id, data_type_attribute_id, data, numerical_equivalent, created_at, updated_at, deleted_at, translations, "position", text_equivalent) VALUES (3, 13, 'Spanish', 1, '2025-07-13 00:00:00', NULL, NULL, '{"ar": "الإسبانية", "de": "Spanisch", "en": "Spanish", "es": "Español", "fr": "Espagnol", "hi": "स्पेनिश", "ja": "スペイン語", "pt": "Espanhol", "ru": "Испанский", "zh": "西班牙语"}', 2, 'es');
INSERT INTO public.listed_data (id, data_type_attribute_id, data, numerical_equivalent, created_at, updated_at, deleted_at, translations, "position", text_equivalent) VALUES (1, 5, 'Masculine', 1, '2025-07-13 00:00:00', NULL, NULL, '{"ar": "ذكر", "de": "Männlich", "en": "Masculine", "es": "Masculino", "fr": "Masculin", "hi": "पुरुष", "ja": "男性", "pt": "Masculino", "ru": "Мужской", "zh": "男性"}', 1, 'Masculine');
INSERT INTO public.listed_data (id, data_type_attribute_id, data, numerical_equivalent, created_at, updated_at, deleted_at, translations, "position", text_equivalent) VALUES (2, 5, 'Femenine', 2, '2025-07-13 00:00:00', NULL, NULL, '{"ar": "أنثى", "de": "Weiblich", "en": "Feminine", "es": "Femenino", "fr": "Féminin", "hi": "स्त्री", "ja": "女性", "pt": "Feminino", "ru": "Женский", "zh": "女性"}', 2, 'Femenine');
INSERT INTO public.listed_data (id, data_type_attribute_id, data, numerical_equivalent, created_at, updated_at, deleted_at, translations, "position", text_equivalent) VALUES (9, 8, 'Low', 2, '2025-07-13 00:00:00', NULL, NULL, '{"ar": "منخفض", "de": "Niedrig", "en": "Low", "es": "Bajo", "fr": "Bas", "hi": "निम्न", "ja": "低い", "pt": "Baixo", "ru": "Низкий", "zh": "低"}', 2, 'Low');
INSERT INTO public.listed_data (id, data_type_attribute_id, data, numerical_equivalent, created_at, updated_at, deleted_at, translations, "position", text_equivalent) VALUES (14, 9, 'Low', 2, '2025-07-13 00:00:00', NULL, NULL, '{"ar": "منخفض", "de": "Niedrig", "en": "Low", "es": "Bajo", "fr": "Bas", "hi": "निम्न", "ja": "低い", "pt": "Baixo", "ru": "Низкий", "zh": "低"}', 2, 'Low');
INSERT INTO public.listed_data (id, data_type_attribute_id, data, numerical_equivalent, created_at, updated_at, deleted_at, translations, "position", text_equivalent) VALUES (6, 12, 'Medium', 2, '2025-07-13 00:00:00', NULL, NULL, '{"ar": "متوسط", "de": "Mittel", "en": "Medium", "es": "Medio", "fr": "Moyen", "hi": "मध्यम", "ja": "中", "pt": "Médio", "ru": "Средний", "zh": "中等"}', 2, 'Medium');
INSERT INTO public.listed_data (id, data_type_attribute_id, data, numerical_equivalent, created_at, updated_at, deleted_at, translations, "position", text_equivalent) VALUES (7, 12, 'High', 3, '2025-07-13 00:00:00', NULL, NULL, '{"ar": "مرتفع", "de": "Hoch", "en": "High", "es": "Alto", "fr": "Haut", "hi": "उच्च", "ja": "高い", "pt": "Alto", "ru": "Высокий", "zh": "高"}', 3, 'High');
INSERT INTO public.listed_data (id, data_type_attribute_id, data, numerical_equivalent, created_at, updated_at, deleted_at, translations, "position", text_equivalent) VALUES (8, 8, 'None', 1, '2025-07-13 00:00:00', NULL, NULL, '{"ar": "لا شيء", "de": "Keine", "en": "None", "es": "Ninguna", "fr": "Aucun", "hi": "कोई नहीं", "ja": "なし", "pt": "Nenhum", "ru": "Никакой", "zh": "无"}', 1, 'None');
INSERT INTO public.listed_data (id, data_type_attribute_id, data, numerical_equivalent, created_at, updated_at, deleted_at, translations, "position", text_equivalent) VALUES (10, 8, 'Medium', 3, '2025-07-13 00:00:00', NULL, NULL, '{"ar": "متوسط", "de": "Mittel", "en": "Medium", "es": "Medio", "fr": "Moyen", "hi": "मध्यम", "ja": "中", "pt": "Médio", "ru": "Средний", "zh": "中等"}', 3, 'Medium');
INSERT INTO public.listed_data (id, data_type_attribute_id, data, numerical_equivalent, created_at, updated_at, deleted_at, translations, "position", text_equivalent) VALUES (11, 8, 'High', 4, '2025-07-13 00:00:00', NULL, NULL, '{"ar": "مرتفع", "de": "Hoch", "en": "High", "es": "Alto", "fr": "Haut", "hi": "उच्च", "ja": "高い", "pt": "Alto", "ru": "Высокий", "zh": "高"}', 4, 'High');
INSERT INTO public.listed_data (id, data_type_attribute_id, data, numerical_equivalent, created_at, updated_at, deleted_at, translations, "position", text_equivalent) VALUES (12, 8, 'Total', 5, '2025-07-13 00:00:00', NULL, NULL, '{"ar": "المجموع", "de": "Gesamt", "en": "Total", "es": "Total", "fr": "Total", "hi": "कुल", "ja": "合計", "pt": "Total", "ru": "Итого", "zh": "总计"}', 5, 'Total');
INSERT INTO public.listed_data (id, data_type_attribute_id, data, numerical_equivalent, created_at, updated_at, deleted_at, translations, "position", text_equivalent) VALUES (13, 9, 'None', 1, '2025-07-13 00:00:00', NULL, NULL, '{"ar": "لا شيء", "de": "Keine", "en": "None", "es": "Ninguna", "fr": "Aucun", "hi": "कोई नहीं", "ja": "なし", "pt": "Nenhum", "ru": "Никакой", "zh": "无"}', 1, 'None');
INSERT INTO public.listed_data (id, data_type_attribute_id, data, numerical_equivalent, created_at, updated_at, deleted_at, translations, "position", text_equivalent) VALUES (15, 9, 'Medium', 3, '2025-07-13 00:00:00', NULL, NULL, '{"ar": "متوسط", "de": "Mittel", "en": "Medium", "es": "Medio", "fr": "Moyen", "hi": "मध्यम", "ja": "中", "pt": "Médio", "ru": "Средний", "zh": "中等"}', 3, 'Medium');
INSERT INTO public.listed_data (id, data_type_attribute_id, data, numerical_equivalent, created_at, updated_at, deleted_at, translations, "position", text_equivalent) VALUES (16, 9, 'High', 4, '2025-07-13 00:00:00', NULL, NULL, '{"ar": "مرتفع", "de": "Hoch", "en": "High", "es": "Alto", "fr": "Haut", "hi": "उच्च", "ja": "高い", "pt": "Alto", "ru": "Высокий", "zh": "高"}', 4, 'High');
INSERT INTO public.listed_data (id, data_type_attribute_id, data, numerical_equivalent, created_at, updated_at, deleted_at, translations, "position", text_equivalent) VALUES (17, 10, 'Preschool', 1, '2025-07-13 00:00:00', NULL, NULL, '{"ar": "ما قبل المدرسة", "de": "Vorschule", "en": "Preschool", "es": "Inicial", "fr": "Préscolaire", "hi": "प्रीस्कूल", "ja": "幼児教育", "pt": "Pré-escolar", "ru": "Дошкольное образование", "zh": "学前教育"}', 1, 'Preschool');
INSERT INTO public.listed_data (id, data_type_attribute_id, data, numerical_equivalent, created_at, updated_at, deleted_at, translations, "position", text_equivalent) VALUES (18, 10, 'Primary education', 2, '2025-07-13 00:00:00', NULL, NULL, '{"ar": "التعليم الابتدائي", "de": "Grundschulbildung", "en": "Primary education", "es": "Básica", "fr": "Éducation primaire", "hi": "प्राथमिक शिक्षा", "ja": "初等教育", "pt": "Educação primária", "ru": "Начальное образование", "zh": "初等教育"}', 2, 'Primaryeducation');
INSERT INTO public.listed_data (id, data_type_attribute_id, data, numerical_equivalent, created_at, updated_at, deleted_at, translations, "position", text_equivalent) VALUES (19, 10, 'High school', 3, '2025-07-13 00:00:00', NULL, NULL, '{"ar": "المدرسة الثانوية", "de": "Oberschule", "en": "High school", "es": "Bachillerato", "fr": "Lycée", "hi": "हाई स्कूल", "ja": "高校", "pt": "Ensino médio", "ru": "Средняя школа", "zh": "高中"}', 3, 'Highschool');
INSERT INTO public.listed_data (id, data_type_attribute_id, data, numerical_equivalent, created_at, updated_at, deleted_at, translations, "position", text_equivalent) VALUES (20, 10, 'Higher education', 4, '2025-07-13 00:00:00', NULL, NULL, '{"ar": "التعليم العالي", "de": "Hochschulbildung", "en": "Higher education", "es": "Superior", "fr": "Éducation supérieure", "hi": "उच्च शिक्षा", "ja": "高等教育", "pt": "Educação superior", "ru": "Высшее образование", "zh": "高等教育"}', 4, 'Highereducation');


--
-- TOC entry 3494 (class 0 OID 167017)
-- Dependencies: 239
-- Data for Name: metrics; Type: TABLE DATA; Schema: public; Owner: aplicaciones
--

INSERT INTO public.metrics (id, code, name, weight, action, created_at, updated_at, deleted_at) VALUES (3, 'pageBalance', 'Page balance', 10, 'evaluatePageBalance()', '2025-08-13 09:43:37.473811', NULL, NULL);
INSERT INTO public.metrics (id, code, name, weight, action, created_at, updated_at, deleted_at) VALUES (8, 'pageContrast', 'Page contrast', 20, 'calculatePageContrast(pageScreenshot)', '2025-08-19 20:59:32.506445', NULL, NULL);
INSERT INTO public.metrics (id, code, name, weight, action, created_at, updated_at, deleted_at) VALUES (1, 'pageReadibility', 'Flesh readibility', 10, 'evaluatePageLegibility()', '2025-08-12 11:00:11.681003', NULL, NULL);
INSERT INTO public.metrics (id, code, name, weight, action, created_at, updated_at, deleted_at) VALUES (4, 'pageSymmetry', 'Page symmetry', 15, 'evaluatePageSymmetry()', '2025-08-13 13:46:27.737024', NULL, NULL);
INSERT INTO public.metrics (id, code, name, weight, action, created_at, updated_at, deleted_at) VALUES (2, 'pageTextDensity', 'Page text density', 15, 'calculatePageTextDensity()', '2025-08-13 09:43:22.074346', NULL, NULL);
INSERT INTO public.metrics (id, code, name, weight, action, created_at, updated_at, deleted_at) VALUES (5, 'pageProportion', 'Page proportion', 5, 'evaluatePageProportion()', '2025-08-13 19:49:38.937129', NULL, NULL);
INSERT INTO public.metrics (id, code, name, weight, action, created_at, updated_at, deleted_at) VALUES (6, 'pageEquilibrium', 'Page equilibrium', 5, 'evaluatePageEquilibrium()', '2025-08-13 19:57:37.373091', NULL, NULL);
INSERT INTO public.metrics (id, code, name, weight, action, created_at, updated_at, deleted_at) VALUES (7, 'pageColourfulness', 'Page colourfulness', 20, 'evaluatePageColourfulness(pageScreenshot)', '2025-08-18 01:47:04.196943', NULL, NULL);


--
-- TOC entry 3486 (class 0 OID 158287)
-- Dependencies: 231
-- Data for Name: model_attribute; Type: TABLE DATA; Schema: public; Owner: aplicaciones
--

INSERT INTO public.model_attribute (id, class_attribute_id, data_acquisition_type_id, data_type_attribute_id, name, code, created_at, updated_at, deleted_at, is_default, "position", translations) VALUES (20, 2, 1, 8, 'Motor limitation', 'motorLimitation', '2025-07-13 00:00:00', NULL, NULL, false, 2, '{"en": {"name": "Motor limitation", "description": "Degree of physical movement difficulty"}, "es": {"name": "Limitación motora", "description": "Grado de dificultad en movimiento físico"}}');
INSERT INTO public.model_attribute (id, class_attribute_id, data_acquisition_type_id, data_type_attribute_id, name, code, created_at, updated_at, deleted_at, is_default, "position", translations) VALUES (16, 1, 1, 5, 'Gender', 'gender', '2025-07-13 00:00:00', NULL, '2025-08-21 12:39:00.650329', true, 2, '{"en": {"name": "Gender", "description": "Self-identified gender"}, "es": {"name": "Género", "description": "Género con el que se identifica"}}');
INSERT INTO public.model_attribute (id, class_attribute_id, data_acquisition_type_id, data_type_attribute_id, name, code, created_at, updated_at, deleted_at, is_default, "position", translations) VALUES (15, 1, 1, 4, 'Birth date', 'birthDate', '2025-07-13 00:00:00', NULL, '2025-08-21 12:39:00.650329', true, 3, '{"en": {"name": "Birth date", "description": "Date of birth in YYYY-MM-DD format"}, "es": {"name": "Fecha de nacimiento", "description": "Fecha de nacimiento en formato AAAA-MM-DD"}}');
INSERT INTO public.model_attribute (id, class_attribute_id, data_acquisition_type_id, data_type_attribute_id, name, code, created_at, updated_at, deleted_at, is_default, "position", translations) VALUES (19, 2, 1, 8, 'Vision limitation', 'visualLimitation', '2025-07-13 00:00:00', NULL, NULL, false, 3, '{"en": {"name": "Vision limitation", "description": "Level of visual impairment for reading"}, "es": {"name": "Limitación visual", "description": "Nivel de dificultad visual para leer"}}');
INSERT INTO public.model_attribute (id, class_attribute_id, data_acquisition_type_id, data_type_attribute_id, name, code, created_at, updated_at, deleted_at, is_default, "position", translations) VALUES (21, 2, 1, 11, 'Limitation of contrast color', 'contrastColorLimitation', '2025-07-13 00:00:00', NULL, '2025-07-20 16:43:51.672913', false, 1, '{"en": {"name": "Limitation of contrast color", "description": "Problems distinguishing similar colors"}, "es": {"name": "Limitación de contraste", "description": "Problemas para distinguir colores similares"}}');
INSERT INTO public.model_attribute (id, class_attribute_id, data_acquisition_type_id, data_type_attribute_id, name, code, created_at, updated_at, deleted_at, is_default, "position", translations) VALUES (14, 1, 1, 3, 'Name', 'name', '2025-07-13 00:00:00', NULL, NULL, true, 1, '{"en": {"name": "Name", "description": "Complete first and last names"}, "es": {"name": "Nombre", "description": "Nombres y apellidos completos"}}');
INSERT INTO public.model_attribute (id, class_attribute_id, data_acquisition_type_id, data_type_attribute_id, name, code, created_at, updated_at, deleted_at, is_default, "position", translations) VALUES (28, 1, 1, 15, 'Password', 'password', '2025-07-17 07:06:26.024445', NULL, NULL, true, 7, '{"en": {"name": "Password", "description": "Password to access to the system"}, "es": {"name": "Contraseña", "description": "Contraseña para ingresar al sistema"}}');
INSERT INTO public.model_attribute (id, class_attribute_id, data_acquisition_type_id, data_type_attribute_id, name, code, created_at, updated_at, deleted_at, is_default, "position", translations) VALUES (17, 1, 1, 3, 'Place of Birth', 'placeOfBirth', '2025-07-13 00:00:00', NULL, NULL, true, 4, '{"en": {"name": "Place of Birth", "description": "City and country of birth"}, "es": {"name": "Lugar de nacimiento", "description": "Ciudad y país de nacimiento"}}');
INSERT INTO public.model_attribute (id, class_attribute_id, data_acquisition_type_id, data_type_attribute_id, name, code, created_at, updated_at, deleted_at, is_default, "position", translations) VALUES (18, 1, 1, 13, 'Preferred Language', 'preferredLanguage', '2025-07-13 00:00:00', NULL, NULL, true, 5, '{"en": {"name": "Preferred Language", "description": "Primary communication language"}, "es": {"name": "Lenguaje preferido", "description": "Idioma principal de comunicación"}}');
INSERT INTO public.model_attribute (id, class_attribute_id, data_acquisition_type_id, data_type_attribute_id, name, code, created_at, updated_at, deleted_at, is_default, "position", translations) VALUES (27, 1, 1, 3, 'Email', 'mail', '2025-07-17 07:04:01.548526', NULL, NULL, true, 6, '{"en": {"name": "Email", "description": "Valid email address"}, "es": {"name": "Correo", "description": "Dirección de correo válida"}}');
INSERT INTO public.model_attribute (id, class_attribute_id, data_acquisition_type_id, data_type_attribute_id, name, code, created_at, updated_at, deleted_at, is_default, "position", translations) VALUES (23, 3, 1, 9, 'Lexical domain', 'lexicalDomain', '2025-07-13 00:00:00', NULL, NULL, false, 1, '{"en": {"name": "Lexical domain", "description": "Primary vocabulary field (medical, technical)"}, "es": {"name": "Dominio léxico", "description": "Área de vocabulario principal (médico, técnico)"}}');
INSERT INTO public.model_attribute (id, class_attribute_id, data_acquisition_type_id, data_type_attribute_id, name, code, created_at, updated_at, deleted_at, is_default, "position", translations) VALUES (22, 3, 1, 10, 'Education level', 'educationLevel', '2025-07-13 00:00:00', NULL, NULL, false, 2, '{"en": {"name": "Education level", "description": "Highest academic degree obtained"}, "es": {"name": "Nivel educativo", "description": "Título académico más alto obtenido"}}');
INSERT INTO public.model_attribute (id, class_attribute_id, data_acquisition_type_id, data_type_attribute_id, name, code, created_at, updated_at, deleted_at, is_default, "position", translations) VALUES (25, 4, 1, 12, 'Hyperlink recognition', 'hyperlinkRecognition', '2025-07-13 00:00:00', NULL, NULL, false, 2, '{"en": {"name": "Hyperlink recognition", "description": "Ability to use clickable links"}, "es": {"name": "Reconocimiento de enlaces", "description": "Capacidad para usar enlaces"}}');
INSERT INTO public.model_attribute (id, class_attribute_id, data_acquisition_type_id, data_type_attribute_id, name, code, created_at, updated_at, deleted_at, is_default, "position", translations) VALUES (24, 4, 1, 12, 'Tecnhology skills', 'technologySkils', '2025-07-13 00:00:00', NULL, NULL, false, 3, '{"en": {"name": "Technology skills", "description": "General digital competence"}, "es": {"name": "Habilidades tecnológicas", "description": "Competencia digital general"}}');
INSERT INTO public.model_attribute (id, class_attribute_id, data_acquisition_type_id, data_type_attribute_id, name, code, created_at, updated_at, deleted_at, is_default, "position", translations) VALUES (26, 4, 1, 12, 'Mouse skills', 'mouseSkills', '2025-07-13 00:00:00', NULL, NULL, false, 1, '{"en": {"name": "Mouse skills", "description": "Computer mouse proficiency level"}, "es": {"name": "Habilidad con el ratón", "description": "Nivel de manejo del ratón"}}');
INSERT INTO public.model_attribute (id, class_attribute_id, data_acquisition_type_id, data_type_attribute_id, name, code, created_at, updated_at, deleted_at, is_default, "position", translations) VALUES (29, 2, 1, 3, 'Description', 'description', '2025-07-17 13:28:41.429908', NULL, '2025-08-21 12:51:08.187678', false, 3, '{"en": {"name": "Description", "description": "Additional explanatory notes"}, "es": {"name": "Descripción", "description": "Notas explicativas adicionales"}}');
INSERT INTO public.model_attribute (id, class_attribute_id, data_acquisition_type_id, data_type_attribute_id, name, code, created_at, updated_at, deleted_at, is_default, "position", translations) VALUES (30, 2, 1, 3, 'PRueba', 'PRueba', '2025-07-17 14:40:24.844976', NULL, '2025-08-21 12:51:08.187678', false, 3, '{"en": {"name": "Test", "description": "Temporary test field"}, "es": {"name": "Prueba", "description": "Campo temporal de prueba"}}');


--
-- TOC entry 3488 (class 0 OID 166428)
-- Dependencies: 233
-- Data for Name: o_result; Type: TABLE DATA; Schema: public; Owner: aplicaciones
--

INSERT INTO public.o_result (json_agg) VALUES ('[{"attributeId" : 19, "attributeName" : "Vision limitation", "attributeName_ts" : {"en": {"name": "Vision limitation", "description": "Level of visual impairment for reading"}, "es": {"name": "Limitación visual", "description": "Nivel de dificultad visual para leer"}}, "attributeCode" : "visualLimitation", "textValue" : "Medium", "dataTypeAttributeId" : 8, "dataTypeAttribute" : "liker5", "dataTypeId" : 2, "dataType" : "Listed", "classAttributeId" : 2, "classAttribute" : "Physical capacities", "classAttribute_ts" : {"ar": "القدرات البدنية", "de": "Physische Fähigkeiten", "en": "Physical capacities", "es": "Capacidades físicas", "fr": "Capacités physiques", "hi": "शारीरिक क्षमताएँ", "ja": "身体的容量", "pt": "Capacidades físicas", "ru": "Физические способности", "zh": "身体能力"}, "isDefault" : false, "position" : 3, "options" : [{"dataListed" : "Low", "dataListed_ts" : {"ar": "منخفض", "de": "Niedrig", "en": "Low", "es": "Bajo", "fr": "Bas", "hi": "निम्न", "ja": "低い", "pt": "Baixo", "ru": "Низкий", "zh": "低"}, "numericalEquivalent" : 2}, {"dataListed" : "Medium", "dataListed_ts" : {"ar": "متوسط", "de": "Mittel", "en": "Medium", "es": "Medio", "fr": "Moyen", "hi": "मध्यम", "ja": "中", "pt": "Médio", "ru": "Средний", "zh": "中等"}, "numericalEquivalent" : 3}, {"dataListed" : "High", "dataListed_ts" : {"ar": "مرتفع", "de": "Hoch", "en": "High", "es": "Alto", "fr": "Haut", "hi": "उच्च", "ja": "高い", "pt": "Alto", "ru": "Высокий", "zh": "高"}, "numericalEquivalent" : 4}, {"dataListed" : "None", "dataListed_ts" : {"ar": "لا شيء", "de": "Keine", "en": "None", "es": "Ninguna", "fr": "Aucun", "hi": "कोई नहीं", "ja": "なし", "pt": "Nenhum", "ru": "Никакой", "zh": "无"}, "numericalEquivalent" : 1}, {"dataListed" : "Total", "dataListed_ts" : {"ar": "المجموع", "de": "Gesamt", "en": "Total", "es": "Total", "fr": "Total", "hi": "कुल", "ja": "合計", "pt": "Total", "ru": "Итого", "zh": "总计"}, "numericalEquivalent" : 5}]}]');


--
-- TOC entry 3490 (class 0 OID 166444)
-- Dependencies: 235
-- Data for Name: rules; Type: TABLE DATA; Schema: public; Owner: aplicaciones
--

INSERT INTO public.rules (id, name, event, condition, actions, priority, created_at, updated_at, deleted_at, translations, rollback_actions) VALUES (4, 'contrast', 'InitialLoad', 'contrastPreference == "HIGH"', '{"document.documentElement.classList.add(\"high-contrast\");"}', 1, '2025-08-21 09:45:44.919024', NULL, NULL, '{"en": {"description": "Change the web page contrast"}, "es": {"description": "Cambiar el contraste de la página web"}}', '{"document.documentElement.classList.remove(\"high-contrast\");"}');
INSERT INTO public.rules (id, name, event, condition, actions, priority, created_at, updated_at, deleted_at, translations, rollback_actions) VALUES (3, 'motor_skills', 'InitialLoad', 'motorSkills == "LOW" || motorSkills == "MEDIUM"', '{"
if (motorSkills == \"MEDIUM\") document.documentElement.classList.add(\"cursor-large\");
if (motorSkills == \"LOW\") document.documentElement.classList.add(\"cursor-extra-large\");
"}', 1, '2025-08-21 09:41:34.684739', NULL, NULL, '{"en": {"description": "Change the cursor size"}, "es": {"description": "Cambiar el tamaño del cursor"}}', '{"document.documentElement.classList.remove(\"cursor-large\");"}');
INSERT INTO public.rules (id, name, event, condition, actions, priority, created_at, updated_at, deleted_at, translations, rollback_actions) VALUES (5, 'hyperlink_recognition', 'InitialLoad', 'hyperlinkRecognition == "LOW"', '{"document.documentElement.classList.add(\"highlight-element-a\");"}', 1, '2025-08-21 09:56:54.133904', NULL, NULL, '{"en": {"description": "Highlight the hyperlinks elements"}, "es": {"description": "Marcar los hipervínculos de la página web"}}', '{"document.documentElement.classList.remove(\"highlight-element-a\");"}');
INSERT INTO public.rules (id, name, event, condition, actions, priority, created_at, updated_at, deleted_at, translations, rollback_actions) VALUES (6, 'visual_processing_capacity', 'InitialLoad', 'visualProcessingCapacity == "LOW"', '{"document.documentElement.classList.add(\"hide-media\");"}', 1, '2025-08-21 10:04:32.129805', NULL, NULL, '{"en": {"description": "Hide the media elements"}, "es": {"description": "Ocultar elementos multimedia"}}', '{"document.documentElement.classList.remove(\"hide-media\");"}');
INSERT INTO public.rules (id, name, event, condition, actions, priority, created_at, updated_at, deleted_at, translations, rollback_actions) VALUES (1, 'limit_vision', 'InitialLoad', 'limitVision == "HIGH" && pageLegibility == "LOW"', '{"changeFont(fontSize, \"px\")"}', 1, '2025-08-06 08:06:23.693194', NULL, NULL, '{"en": {"description": "Change the font size"}, "es": {"description": "Cambiar el tamaño de texto"}}', '{"removeStyleProperty(\"*:not(.accessibility-panel):not(accessibility-panel *)\", [\"font-size\"])"}');
INSERT INTO public.rules (id, name, event, condition, actions, priority, created_at, updated_at, deleted_at, translations, rollback_actions) VALUES (2, 'dyslexical', 'InitialLoad', 'isDyslexical == "YES"', '{"changeFontFamily(\"OpenDyslexic\")"}', 1, '2025-08-21 07:08:14.804471', NULL, NULL, '{"en": {"description": "Change the font family"}, "es": {"description": "Cambiar el tipo de fuente de la página a tipo dislexia"}}', '{"removeStyleProperty(\"*:not(i):not(span):not(.fa):not(.fas)\", [\"font-family\"])"}');


--
-- TOC entry 3487 (class 0 OID 158293)
-- Dependencies: 232
-- Data for Name: v_record; Type: TABLE DATA; Schema: public; Owner: aplicaciones
--

INSERT INTO public.v_record (name, mail, code_mail) VALUES ('', 'invalid-email', 'ABC123');
INSERT INTO public.v_record (name, mail, code_mail) VALUES ('', 'invalid-email', 'ABC123');
INSERT INTO public.v_record (name, mail, code_mail) VALUES ('', 'invalid-email', 'ABC123');
INSERT INTO public.v_record (name, mail, code_mail) VALUES ('', 'invalid-email', 'ABC123');


--
-- TOC entry 3504 (class 0 OID 0)
-- Dependencies: 236
-- Name: actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aplicaciones
--

SELECT pg_catalog.setval('public.actions_id_seq', 17, true);


--
-- TOC entry 3505 (class 0 OID 0)
-- Dependencies: 214
-- Name: class_model_attribute_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aplicaciones
--

SELECT pg_catalog.setval('public.class_model_attribute_id_seq', 5, true);


--
-- TOC entry 3506 (class 0 OID 0)
-- Dependencies: 216
-- Name: data_acquisition_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aplicaciones
--

SELECT pg_catalog.setval('public.data_acquisition_type_id_seq', 2, true);


--
-- TOC entry 3507 (class 0 OID 0)
-- Dependencies: 220
-- Name: data_type_attribute_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aplicaciones
--

SELECT pg_catalog.setval('public.data_type_attribute_id_seq', 15, true);


--
-- TOC entry 3508 (class 0 OID 0)
-- Dependencies: 218
-- Name: data_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aplicaciones
--

SELECT pg_catalog.setval('public.data_type_id_seq', 3, true);


--
-- TOC entry 3509 (class 0 OID 0)
-- Dependencies: 224
-- Name: elderly_user_attribute_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aplicaciones
--

SELECT pg_catalog.setval('public.elderly_user_attribute_id_seq', 409, true);


--
-- TOC entry 3510 (class 0 OID 0)
-- Dependencies: 222
-- Name: elderly_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aplicaciones
--

SELECT pg_catalog.setval('public.elderly_user_id_seq', 95, true);


--
-- TOC entry 3511 (class 0 OID 0)
-- Dependencies: 226
-- Name: elderly_user_model_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aplicaciones
--

SELECT pg_catalog.setval('public.elderly_user_model_id_seq', 1, true);


--
-- TOC entry 3512 (class 0 OID 0)
-- Dependencies: 228
-- Name: listed_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aplicaciones
--

SELECT pg_catalog.setval('public.listed_data_id_seq', 20, true);


--
-- TOC entry 3513 (class 0 OID 0)
-- Dependencies: 238
-- Name: metrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aplicaciones
--

SELECT pg_catalog.setval('public.metrics_id_seq', 8, true);


--
-- TOC entry 3514 (class 0 OID 0)
-- Dependencies: 230
-- Name: model_attribute_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aplicaciones
--

SELECT pg_catalog.setval('public.model_attribute_id_seq', 30, true);


--
-- TOC entry 3515 (class 0 OID 0)
-- Dependencies: 234
-- Name: rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aplicaciones
--

SELECT pg_catalog.setval('public.rules_id_seq', 6, true);


--
-- TOC entry 3316 (class 2606 OID 166478)
-- Name: actions actions_pkey; Type: CONSTRAINT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.actions
    ADD CONSTRAINT actions_pkey PRIMARY KEY (id);


--
-- TOC entry 3318 (class 2606 OID 167022)
-- Name: metrics metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.metrics
    ADD CONSTRAINT metrics_pkey PRIMARY KEY (id);


--
-- TOC entry 3286 (class 2606 OID 158299)
-- Name: class_model_attribute pk_class_model_attribute; Type: CONSTRAINT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.class_model_attribute
    ADD CONSTRAINT pk_class_model_attribute PRIMARY KEY (id);


--
-- TOC entry 3289 (class 2606 OID 158301)
-- Name: data_acquisition_type pk_data_acquisition_type; Type: CONSTRAINT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.data_acquisition_type
    ADD CONSTRAINT pk_data_acquisition_type PRIMARY KEY (id);


--
-- TOC entry 3292 (class 2606 OID 158303)
-- Name: data_type pk_data_type; Type: CONSTRAINT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.data_type
    ADD CONSTRAINT pk_data_type PRIMARY KEY (id);


--
-- TOC entry 3295 (class 2606 OID 158305)
-- Name: data_type_attribute pk_data_type_attribute; Type: CONSTRAINT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.data_type_attribute
    ADD CONSTRAINT pk_data_type_attribute PRIMARY KEY (id);


--
-- TOC entry 3298 (class 2606 OID 158307)
-- Name: elderly_user pk_elderly_user; Type: CONSTRAINT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.elderly_user
    ADD CONSTRAINT pk_elderly_user PRIMARY KEY (id);


--
-- TOC entry 3303 (class 2606 OID 158309)
-- Name: elderly_user_attribute pk_elderly_user_attribute; Type: CONSTRAINT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.elderly_user_attribute
    ADD CONSTRAINT pk_elderly_user_attribute PRIMARY KEY (id);


--
-- TOC entry 3306 (class 2606 OID 158311)
-- Name: elderly_user_model pk_elderly_user_model; Type: CONSTRAINT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.elderly_user_model
    ADD CONSTRAINT pk_elderly_user_model PRIMARY KEY (id);


--
-- TOC entry 3309 (class 2606 OID 158313)
-- Name: listed_data pk_listed_data; Type: CONSTRAINT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.listed_data
    ADD CONSTRAINT pk_listed_data PRIMARY KEY (id);


--
-- TOC entry 3312 (class 2606 OID 158315)
-- Name: model_attribute pk_model_attribute; Type: CONSTRAINT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.model_attribute
    ADD CONSTRAINT pk_model_attribute PRIMARY KEY (id);


--
-- TOC entry 3314 (class 2606 OID 166451)
-- Name: rules rules_pkey; Type: CONSTRAINT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.rules
    ADD CONSTRAINT rules_pkey PRIMARY KEY (id);


--
-- TOC entry 3300 (class 2606 OID 174620)
-- Name: elderly_user un_elderly_user_mail; Type: CONSTRAINT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.elderly_user
    ADD CONSTRAINT un_elderly_user_mail UNIQUE (mail);


--
-- TOC entry 3284 (class 1259 OID 158316)
-- Name: idx_class_model_attribute_user_model; Type: INDEX; Schema: public; Owner: aplicaciones
--

CREATE INDEX idx_class_model_attribute_user_model ON public.class_model_attribute USING btree (user_model_id);


--
-- TOC entry 3287 (class 1259 OID 158317)
-- Name: idx_data_acquisition_type_type; Type: INDEX; Schema: public; Owner: aplicaciones
--

CREATE INDEX idx_data_acquisition_type_type ON public.data_acquisition_type USING btree (type);


--
-- TOC entry 3293 (class 1259 OID 158318)
-- Name: idx_data_type_attribute_type; Type: INDEX; Schema: public; Owner: aplicaciones
--

CREATE INDEX idx_data_type_attribute_type ON public.data_type_attribute USING btree (data_type_id);


--
-- TOC entry 3290 (class 1259 OID 158319)
-- Name: idx_data_type_type; Type: INDEX; Schema: public; Owner: aplicaciones
--

CREATE INDEX idx_data_type_type ON public.data_type USING btree (type);


--
-- TOC entry 3301 (class 1259 OID 158320)
-- Name: idx_elderly_user_attribute_user; Type: INDEX; Schema: public; Owner: aplicaciones
--

CREATE INDEX idx_elderly_user_attribute_user ON public.elderly_user_attribute USING btree (elderly_user_id);


--
-- TOC entry 3296 (class 1259 OID 158321)
-- Name: idx_elderly_user_mail; Type: INDEX; Schema: public; Owner: aplicaciones
--

CREATE INDEX idx_elderly_user_mail ON public.elderly_user USING btree (mail);


--
-- TOC entry 3304 (class 1259 OID 158322)
-- Name: idx_elderly_user_model_name; Type: INDEX; Schema: public; Owner: aplicaciones
--

CREATE INDEX idx_elderly_user_model_name ON public.elderly_user_model USING btree (name);


--
-- TOC entry 3307 (class 1259 OID 158323)
-- Name: idx_listed_data_type_attribute; Type: INDEX; Schema: public; Owner: aplicaciones
--

CREATE INDEX idx_listed_data_type_attribute ON public.listed_data USING btree (data_type_attribute_id);


--
-- TOC entry 3310 (class 1259 OID 158324)
-- Name: idx_model_attribute_class_attribute; Type: INDEX; Schema: public; Owner: aplicaciones
--

CREATE INDEX idx_model_attribute_class_attribute ON public.model_attribute USING btree (class_attribute_id);


--
-- TOC entry 3319 (class 2606 OID 158325)
-- Name: class_model_attribute fk_class_model_attribute_user_model_id; Type: FK CONSTRAINT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.class_model_attribute
    ADD CONSTRAINT fk_class_model_attribute_user_model_id FOREIGN KEY (user_model_id) REFERENCES public.elderly_user_model(id);


--
-- TOC entry 3320 (class 2606 OID 158330)
-- Name: data_type_attribute fk_data_type_attribute_data_type_id; Type: FK CONSTRAINT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.data_type_attribute
    ADD CONSTRAINT fk_data_type_attribute_data_type_id FOREIGN KEY (data_type_id) REFERENCES public.data_type(id);


--
-- TOC entry 3321 (class 2606 OID 158335)
-- Name: elderly_user_attribute fk_elderly_user_attribute_attribute_id; Type: FK CONSTRAINT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.elderly_user_attribute
    ADD CONSTRAINT fk_elderly_user_attribute_attribute_id FOREIGN KEY (attribute_id) REFERENCES public.model_attribute(id);


--
-- TOC entry 3322 (class 2606 OID 158340)
-- Name: elderly_user_attribute fk_elderly_user_attribute_elderly_user_id; Type: FK CONSTRAINT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.elderly_user_attribute
    ADD CONSTRAINT fk_elderly_user_attribute_elderly_user_id FOREIGN KEY (elderly_user_id) REFERENCES public.elderly_user(id);


--
-- TOC entry 3323 (class 2606 OID 158345)
-- Name: listed_data fk_listed_data_data_type_attribute_id; Type: FK CONSTRAINT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.listed_data
    ADD CONSTRAINT fk_listed_data_data_type_attribute_id FOREIGN KEY (data_type_attribute_id) REFERENCES public.data_type_attribute(id);


--
-- TOC entry 3324 (class 2606 OID 158350)
-- Name: model_attribute fk_model_attribute_class_attribute_id; Type: FK CONSTRAINT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.model_attribute
    ADD CONSTRAINT fk_model_attribute_class_attribute_id FOREIGN KEY (class_attribute_id) REFERENCES public.class_model_attribute(id);


--
-- TOC entry 3325 (class 2606 OID 158355)
-- Name: model_attribute fk_model_attribute_data_acquisition_type_id; Type: FK CONSTRAINT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.model_attribute
    ADD CONSTRAINT fk_model_attribute_data_acquisition_type_id FOREIGN KEY (data_acquisition_type_id) REFERENCES public.data_acquisition_type(id);


--
-- TOC entry 3326 (class 2606 OID 158360)
-- Name: model_attribute fk_model_attribute_data_type_attribute_id; Type: FK CONSTRAINT; Schema: public; Owner: aplicaciones
--

ALTER TABLE ONLY public.model_attribute
    ADD CONSTRAINT fk_model_attribute_data_type_attribute_id FOREIGN KEY (data_type_attribute_id) REFERENCES public.data_type_attribute(id);


-- Completed on 2025-08-27 00:08:40

--
-- PostgreSQL database dump complete
--

